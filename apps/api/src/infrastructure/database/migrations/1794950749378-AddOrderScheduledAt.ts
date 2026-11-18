import type { MigrationInterface, QueryRunner } from 'typeorm';

// Adds when the customer wants each order. Orders placed before this column existed get their
// creation time, so the column can be NOT NULL.
export class AddOrderScheduledAt1794950749378 implements MigrationInterface {
    name = 'AddOrderScheduledAt1794950749378';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "scheduled_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`UPDATE "orders" SET "scheduled_at" = "created_at"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "scheduled_at" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "scheduled_at"`);
    }
}
