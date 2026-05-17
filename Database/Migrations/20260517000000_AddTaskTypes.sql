-- Migration: AddTaskTypes
-- Date: 2026-05-17
-- Adds the task_types table and a nullable type_id FK on tasks.
-- Safe to run against a live database — all changes are additive.

-- ============================================================
-- 1. task_types table
-- ============================================================
CREATE TABLE IF NOT EXISTS task_types (
    id         INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id  INTEGER      NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    color      VARCHAR(20)  NOT NULL,
    sort_order INTEGER      NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS ix_task_types_tenant_id ON task_types (tenant_id);

-- ============================================================
-- 2. Add type_id column to tasks
-- ============================================================
ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS type_id INTEGER NULL
        REFERENCES task_types (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS ix_tasks_type_id ON tasks (type_id);

-- ============================================================
-- 3. Record migration in EF history
-- ============================================================
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
SELECT '20260517000000_AddTaskTypes', '10.0.1'
WHERE NOT EXISTS (
    SELECT 1 FROM "__EFMigrationsHistory"
    WHERE "MigrationId" = '20260517000000_AddTaskTypes'
);
