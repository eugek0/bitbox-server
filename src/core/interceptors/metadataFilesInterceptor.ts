import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";

@Injectable()
export class MetadataFilesInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest() as Request;

    if (Array.isArray(request.files)) {
      request.files.forEach((file, index) => {
        file.temp = file.path;
        file.path = request.body?.metadata?.[index];
        file.originalname = Buffer.from(file.originalname, "latin1").toString(
          "utf8",
        );
      });
    }

    return next.handle();
  }
}
