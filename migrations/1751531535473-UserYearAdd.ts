import { MigrationInterface, QueryRunner } from "typeorm";

export class UserYearAdd1751531535473 implements MigrationInterface {
    name = 'UserYearAdd1751531535473'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "year" integer`);
        await queryRunner.query(`ALTER TABLE "article" ALTER COLUMN "createdAt" SET DEFAULT '"2025-07-03T08:32:18.540Z"'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" ALTER COLUMN "createdAt" SET DEFAULT '2025-07-03 07:02:03.492'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "year"`);
    }

}
