-- Migration: AddTaskPriority
-- Date: 2026-05-17
-- Adds a nullable priority column to tasks (Low / Medium / High stored as string).
-- Additive only — safe to run against a live database.

ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NULL;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
SELECT '20260517000001_AddTaskPriority', '10.0.1'
WHERE NOT EXISTS (
    SELECT 1 FROM "__EFMigrationsHistory"
    WHERE "MigrationId" = '20260517000001_AddTaskPriority'
);
