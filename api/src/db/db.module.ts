import { type DynamicModule, Module } from "@nestjs/common";
import { DB, type Db } from ".";

@Module({})
export class DbModule {
  static forRoot = (db: Db): DynamicModule => ({ module: DbModule, global: true, providers: [{ provide: DB, useValue: db }], exports: [DB] });
}
