import { Injectable } from "@nestjs/common";
import fs from "fs/promises";

@Injectable()
export class AppService {
  async getFileSystem(): Promise<any> {
    return fs.readdir("/home");
  }
}
