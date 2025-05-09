import { Test, TestingModule } from "@nestjs/testing";
import { StoragesService } from "./storages.service";
import { getModelToken } from "@nestjs/mongoose";
import { Storage } from "./schemas/storage.schema";
import * as fs from "fs/promises";
import * as path from "path";
import { CreateStorageDto } from "./dtos";
import { UsersService } from "@/users";
import { EntitiesService } from "@/entities";
import { STORAGE_ROOT } from "@/core";
import { NotFoundException } from "@nestjs/common";

jest.mock("fs/promises");

describe("StoragesService", () => {
  let service: StoragesService;
  let mockStorageModel: jest.Mock;

  const mockSave = jest.fn();
  const mockStorageDoc = {
    save: mockSave,
    _id: { toString: () => "mock-storage-id" },
  };

  beforeEach(async () => {
    mockStorageModel = jest.fn().mockImplementation(() => mockStorageDoc);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoragesService,
        {
          provide: getModelToken(Storage.name),
          useValue: mockStorageModel,
        },
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: EntitiesService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<StoragesService>(StoragesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("должен создать хранилище", async () => {
    jest.spyOn(service, "getByName").mockResolvedValue(null);
    const mkdirMock = fs.mkdir as jest.Mock;
    mkdirMock.mockResolvedValue(undefined);

    const dto: CreateStorageDto = {
      name: "Test Storage",
      description: "Test description",
      size: 1024,
      access: "private",
    };

    await service.create(dto, "user-id");

    expect(service.getByName).toHaveBeenCalledWith(dto.name);
    expect(mkdirMock).toHaveBeenCalledWith(
      path.join(STORAGE_ROOT || "storage", "mock-storage-id"),
      { recursive: true },
    );
    expect(mockStorageModel).toHaveBeenCalledWith(
      expect.objectContaining({
        name: dto.name,
        description: dto.description,
        size: dto.size,
        access: dto.access,
        owner: "user-id",
        used: 0,
        createdAt: expect.any(String),
      }),
    );
    expect(mockSave).toHaveBeenCalled();
  });
});

describe("StoragesService", () => {
  let service: StoragesService;
  let storageModel: any;

  beforeEach(async () => {
    const mockStorageModel = {
      findByIdAndUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoragesService,
        {
          provide: getModelToken("Storage"),
          useValue: mockStorageModel,
        },
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: EntitiesService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<StoragesService>(StoragesService);
    storageModel = module.get(getModelToken("Storage"));

    jest.spyOn(service, "getById").mockImplementation(async (id: string) => {
      if (id === "existing-id") {
        return {
          _id: "existing-id",
          name: "Тестовое хранилище",
          description: "Описание тестового хранилища",
          owner: "user123",
          used: 0,
          size: 100,
          access: "private",
          members: [],
          restrictFileSize: false,
          maxFileSize: undefined,
          restrictFilesCount: false,
          maxFilesCount: undefined,
          createdAt: new Date().toISOString(),
        } as any;
      } else {
        return null;
      }
    });
  });

  it("должен обновить хранилище, если оно существует", async () => {
    const dto = { name: "Updated", size: 100, access: "private" };
    await service.edit(dto, "existing-id");

    expect(storageModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "existing-id",
      dto,
    );
  });

  it("должен выбросить исключение, если хранилище не найдено", async () => {
    await expect(service.edit({}, "missing-id")).rejects.toThrow(
      NotFoundException,
    );
  });
});
