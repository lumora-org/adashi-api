import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersAndSessions1731600000000 implements MigrationInterface {
  name = 'CreateUsersAndSessions1731600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "users_account_status_enum" AS ENUM ('ACTIVE', 'SUSPENDED', 'CLOSED');
    `);
    await queryRunner.query(`
      CREATE TYPE "users_verification_status_enum" AS ENUM ('UNVERIFIED', 'VERIFIED');
    `);
    await queryRunner.query(`
      CREATE TYPE "users_platform_role_enum" AS ENUM (
        'USER', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'PLATFORM_SUPPORT',
        'PLATFORM_FINANCE', 'PLATFORM_AUDITOR'
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "full_name" character varying(120) NOT NULL,
        "email" character varying(255) NOT NULL,
        "phone_number" character varying(30),
        "password_hash" text NOT NULL,
        "account_status" "users_account_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "verification_status" "users_verification_status_enum" NOT NULL DEFAULT 'UNVERIFIED',
        "platform_role" "users_platform_role_enum" NOT NULL DEFAULT 'USER',
        "email_verification_code" character varying(10),
        "email_verification_expires_at" TIMESTAMPTZ,
        "mfa_enabled" boolean NOT NULL DEFAULT false,
        "last_login_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_users_email" ON "users" ("email");
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_users_phone_number" ON "users" ("phone_number");
    `);

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "token_hash" character varying(64) NOT NULL,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "revoked_at" TIMESTAMPTZ,
        "replaced_by" uuid,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_tokens_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_refresh_tokens_token_hash"
      ON "refresh_tokens" ("token_hash");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_refresh_tokens_user_id"
      ON "refresh_tokens" ("user_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "users_platform_role_enum"`);
    await queryRunner.query(`DROP TYPE "users_verification_status_enum"`);
    await queryRunner.query(`DROP TYPE "users_account_status_enum"`);
  }
}
