import { Entity } from "../schemas";
import { IEntityBreadcrumb } from "../types";

export class GetEntitiesDto {
  readonly items: Entity[];

  readonly breadcrumbs: IEntityBreadcrumb[];
}
