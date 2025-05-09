import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { EntitiesService } from "./entities.service";
import { StoragesService } from "../storages/storages.service";
import { UsersService } from "../users/users.service";
import { Entity } from "./schemas";
import * as fsp from "fs/promises";
import * as path from "path";
import * as utils from "fs";
import * as mongoose from "mongoose";

describe("EntitiesService", () => {
  let service: EntitiesService;
  let modelMock: jest.Mock;
  let saveMock: jest.Mock;

  beforeEach(async () => {
    saveMock = jest.fn();
    modelMock = jest.fn().mockImplementation(() => ({ save: saveMock }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntitiesService,
        {
          provide: getModelToken(Entity.name),
          useValue: modelMock,
        },
        {
          provide: StoragesService,
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<EntitiesService>(EntitiesService);
  });

  it("должен создать директорию", async () => {
    const dto = {
      name: "Новая папка",
      parent: null,
    };
    const storageid = "storage-id";
    const uploader = "user-id";

    await service.createDirectory(dto, storageid, uploader);

    expect(modelMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: dto.name,
        fullname: dto.name,
        storage: storageid,
        parent: dto.parent,
        type: "directory",
        uploader,
        size: 0,
      }),
    );

    expect(saveMock).toHaveBeenCalled();
  });
});

jest.mock("fs/promises");
jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  existsSync: jest.fn(),
}));
jest.mock("path");

describe("EntitiesService - upload", () => {
  let service: EntitiesService;
  let entityModelMock: any;
  let storagesServiceMock: any;

  beforeEach(async () => {
    entityModelMock = {
      bulkSave: jest.fn(),
    };

    storagesServiceMock = {
      getById: jest.fn(),
      edit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntitiesService,
        {
          provide: getModelToken(Entity.name),
          useValue: jest.fn().mockImplementation((data) => ({ ...data })),
        },
        {
          provide: StoragesService,
          useValue: storagesServiceMock,
        },
        {
          provide: UsersService,
          useValue: {
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EntitiesService>(EntitiesService);
    service["get"] = jest.fn().mockResolvedValue([]);
    service["validateStorageLimits"] = jest.fn();
    service["createPathTreeAndReturnParentId"] = jest
      .fn()
      .mockResolvedValue(null);
    service["updateFolderSizes"] = jest.fn();
    (service as any)["entityModel"] = {
      bulkSave: jest.fn(),
    };
  });

  it("успешно загружает файл", async () => {
    const storageid = "storage123";
    const uploader = "user123";
    const dto = { parent: null };
    const file = {
      originalname: "test.txt",
      size: 123,
      path: "uploads/temp/test.txt",
      temp: "uploads/temp/test.txt",
    };

    storagesServiceMock.getById.mockResolvedValue({ _id: storageid, used: 0 });
    (utils.existsSync as jest.Mock).mockReturnValue(true);
    (fsp.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fsp.cp as jest.Mock).mockResolvedValue(undefined);
    (fsp.unlink as jest.Mock).mockResolvedValue(undefined);

    await service.upload([file as any], storageid, dto, uploader);

    expect(storagesServiceMock.getById).toHaveBeenCalledWith(storageid);
    expect(service["validateStorageLimits"]).toHaveBeenCalled();
    expect(service["updateFolderSizes"]).toHaveBeenCalledWith(null, 123);
    expect(service["entityModel"].bulkSave).toHaveBeenCalled();
    expect(storagesServiceMock.edit).toHaveBeenCalledWith(
      { used: 123 },
      storageid,
    );
  });
});
