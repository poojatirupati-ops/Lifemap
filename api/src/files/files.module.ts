import { type DynamicModule, Module } from "@nestjs/common";
import { FILES, type Files } from "../files";

/** Documents store: S3 presigning in production, a local folder in dev and tests (src/files.ts). */
@Module({})
export class FilesModule {
  static forRoot = (files: Files): DynamicModule => ({ module: FilesModule, global: true, providers: [{ provide: FILES, useValue: files }], exports: [FILES] });
}
