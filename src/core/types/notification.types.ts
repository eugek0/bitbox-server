import { PlacementType } from "./aliases.types";

export type NotificationStatusType = "info" | "error" | "success" | "warning";

export interface INotificationConfig {
  message: string;
  description?: string;
  closable?: boolean;
  duration?: number;
  placement?: PlacementType;
}

export interface INotification {
  status: NotificationStatusType;
  config: INotificationConfig;
}
