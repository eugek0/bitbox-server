import { Injectable } from "@nestjs/common";
import * as fs from "fs/promises";

@Injectable()
export class AppService {
  async getFileSystem(): Promise<any> {
    return fs.readdir("/home");
  }
}
