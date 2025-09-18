import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1758127180195 implements MigrationInterface {
    name = 'Migrations1758127180195'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" ALTER COLUMN "createdAt" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" ALTER COLUMN "createdAt" SET DEFAULT '2025-07-03 07:02:03.492'`);
    }

}
