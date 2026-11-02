import { type DynamicModule, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { SendOtp } from "./auth";
import { AuthModule } from "./auth/auth.module";
import { BookingsModule } from "./bookings/bookings.module";
import type { Db } from "./db";
import { DbModule } from "./db/db.module";
import { DocumentsModule } from "./documents/documents.module";
import type { Files } from "./files";
import { FilesModule } from "./files/files.module";
import { MeModule } from "./me/me.module";
import { PlanModule } from "./plan/plan.module";
import { TenantModule } from "./tenant/tenant.module";

/** The application layer. Infrastructure comes from the caller (buildApp), so tests pass their own Db, OTP sender and Files store. */
@Module({})
export class AppModule {
  static forRoot = (db: Db, sendOtp: SendOtp, files: Files): DynamicModule => ({
    module: AppModule,
    imports: [DbModule.forRoot(db), FilesModule.forRoot(files), AuthModule.forRoot(sendOtp), TenantModule, PlanModule, MeModule, DocumentsModule, BookingsModule],
  });
}

/** A standalone Nest application context (no HTTP platform: Hono serves HTTP). Errors throw instead of exiting the process; logs go through Powertools, not Nest. */
export const createNest = (db: Db, sendOtp: SendOtp, files: Files) =>
  NestFactory.createApplicationContext(AppModule.forRoot(db, sendOtp, files), { logger: false, abortOnError: false });
