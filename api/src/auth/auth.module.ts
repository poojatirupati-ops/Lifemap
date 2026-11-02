import { type DynamicModule, Module } from "@nestjs/common";
import { AUTH, SEND_OTP, type SendOtp, createAuth } from "../auth";
import { DB } from "../db";
import { FILES } from "../files";

/** The Better Auth instance, built once per Nest context from the Db, the OTP sender and the Files store. */
@Module({})
export class AuthModule {
  static forRoot = (sendOtp: SendOtp): DynamicModule => ({
    module: AuthModule,
    global: true,
    providers: [{ provide: SEND_OTP, useValue: sendOtp }, { provide: AUTH, useFactory: createAuth, inject: [DB, SEND_OTP, FILES] }],
    exports: [AUTH],
  });
}
