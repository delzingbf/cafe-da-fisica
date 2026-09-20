import type { MigrationInterface, QueryRunner } from 'typeorm';

// Initial schema: products, orders (+ items), admins and the single-row settings table.
// Constraint names follow TypeORM's default naming strategy so `migration:generate` sees no drift.
export class Init1789851716227 implements MigrationInterface {
    name = 'Init1789851716227';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "products" ("id" SERIAL NOT NULL, "name" text NOT NULL, "price" numeric(10,2) NOT NULL, "shown" boolean NOT NULL DEFAULT true, "available" boolean NOT NULL DEFAULT true, "vegan" boolean NOT NULL DEFAULT false, "image_url" text, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
        );

        await queryRunner.query(
            `CREATE TYPE "public"."order_payment_option" AS ENUM('pix', 'cash')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'cancelled')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."order_delivery_method" AS ENUM('delivery', 'pickup')`,
        );
        await queryRunner.query(
            `CREATE TABLE "orders" ("id" SERIAL NOT NULL, "customer_name" text NOT NULL, "customer_email" text NOT NULL, "payment_option" "public"."order_payment_option" NOT NULL DEFAULT 'pix', "status" "public"."order_status" NOT NULL DEFAULT 'pending', "delivery_method" "public"."order_delivery_method" NOT NULL DEFAULT 'delivery', "delivery_location" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_orders_customer_email_lowercase" CHECK ("customer_email" = lower("customer_email")), CONSTRAINT "CHK_orders_customer_email_format" CHECK ("customer_email" ~ '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
        );

        await queryRunner.query(
            `CREATE TABLE "order_items" ("order_id" integer NOT NULL, "product_id" integer NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, CONSTRAINT "CHK_order_items_quantity_positive" CHECK ("quantity" > 0), CONSTRAINT "PK_6335813ef19bc35b8d866cc6565" PRIMARY KEY ("order_id", "product_id"))`,
        );

        await queryRunner.query(
            `CREATE TABLE "admins" ("id" SERIAL NOT NULL, "email" text NOT NULL, "password_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_login_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_admins_email" UNIQUE ("email"), CONSTRAINT "CHK_admins_email_lowercase" CHECK ("email" = lower("email")), CONSTRAINT "CHK_admins_email_format" CHECK ("email" ~ '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'), CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id"))`,
        );

        await queryRunner.query(
            `CREATE TABLE "settings" ("id" boolean NOT NULL DEFAULT true, "order_notification_email" text NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" integer, CONSTRAINT "CHK_settings_order_notification_email_lowercase" CHECK ("order_notification_email" = lower("order_notification_email")), CONSTRAINT "CHK_settings_order_notification_email_format" CHECK ("order_notification_email" ~ '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'), CONSTRAINT "CHK_settings_singleton" CHECK ("id"), CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`,
        );

        await queryRunner.query(
            `ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_items" ADD CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "settings" ADD CONSTRAINT "FK_2e89ab90a38669764401e356223" FOREIGN KEY ("updated_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "settings" DROP CONSTRAINT "FK_2e89ab90a38669764401e356223"`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_items" DROP CONSTRAINT "FK_9263386c35b6b242540f9493b00"`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`,
        );
        await queryRunner.query(`DROP TABLE "settings"`);
        await queryRunner.query(`DROP TABLE "admins"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."order_delivery_method"`);
        await queryRunner.query(`DROP TYPE "public"."order_status"`);
        await queryRunner.query(`DROP TYPE "public"."order_payment_option"`);
        await queryRunner.query(`DROP TABLE "products"`);
    }
}
