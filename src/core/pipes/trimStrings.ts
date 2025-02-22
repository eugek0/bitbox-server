import { PipeTransform, Injectable } from "@nestjs/common";

@Injectable()
export class TrimStringsPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value !== "object" || value === null) {
      return value;
    }

    return this.trimStrings(value);
  }

  private trimStrings(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.trimStrings(item));
    } else if (typeof obj === "object" && obj !== null) {
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = this.trimStrings(obj[key]);
        return acc;
      }, {} as any);
    } else if (typeof obj === "string") {
      return obj.trim();
    }

    return obj;
  }
}
