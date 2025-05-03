import { Method } from "@/logger/schemas/method.schema";

export const METHODS_SEED: Omit<Method, "_id">[] = [
  {
    name: "POST /storages",
    description: "Создание хранилища",
  },
  {
    name: "DELETE /storages",
    description: "Удаление хранилища/хранилищ",
  },
  {
    name: "PUT /storages",
    description: "Редактирование хранилища",
  },
  {
    name: "POST /entities/blob",
    description: "Скачивание сущности/сущностей",
  },
  {
    name: "POST /entities",
    description: "Загрузка сущности/сущностей",
  },
  {
    name: "POST /entities/mkdir",
    description: "Создание директории",
  },
  {
    name: "DELETE /entities/rm",
    description: "Удаление сущности/сущностей",
  },
  {
    name: "PATCH /entities/rename",
    description: "Переименование сущности",
  },
  {
    name: "POST /entities/paste",
    description: "Вставка сущности/сущностей",
  },
  {
    name: "PATCH /users/role",
    description: "Смена роли пользователя",
  },
  {
    name: "PATCH /users/avatar",
    description: "Смена аватара пользователя",
  },
  {
    name: "PATCH /users",
    description: "Редактирование профиля пользователя",
  },
];
