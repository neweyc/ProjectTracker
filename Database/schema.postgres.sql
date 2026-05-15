-- Olive Invoice Schema
-- PostgreSQL 15+
-- Run this script against an empty database to create the full schema.
-- Uses IF NOT EXISTS throughout so it is safe to re-run on an existing database.
--
-- Table creation order respects foreign key dependencies:
--   tenants -> users -> external_logins
--   tenants -> projects -> tasks -> time_entries
--                                -> invoice_line_items
--                       -> invoices -> invoice_line_items
--   tenants -> system_settings

-- ============================================================
-- Tenants
-- ============================================================
CREATE TABLE IF NOT EXISTS tenants (
    id         INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    slug       VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_tenants_slug ON tenants (slug);

-- ============================================================
-- Users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id     INTEGER      NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
    email         VARCHAR(256) NOT NULL,
    display_name  VARCHAR(200) NOT NULL,
    password_hash VARCHAR(500)     NULL,   -- NULL for OAuth-only accounts
    created_at    TIMESTAMPTZ  NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email ON users (email);

-- ============================================================
-- ExternalLogins  (Google, GitHub, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS external_logins (
    id                  INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id             INTEGER      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    provider            VARCHAR(50)  NOT NULL,   -- 'google', 'github', etc.
    provider_subject_id VARCHAR(256) NOT NULL,   -- OIDC "sub" claim
    created_at          TIMESTAMPTZ  NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_external_logins_provider_subject
    ON external_logins (provider, provider_subject_id);

-- ============================================================
-- Projects
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id   INTEGER      NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    description VARCHAR(2000)    NULL,
    created_at  TIMESTAMPTZ  NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_projects_tenant_id ON projects (tenant_id);

-- ============================================================
-- Tasks  (self-referencing: subtasks point back to a parent)
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
    id             INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id     INTEGER      NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    parent_task_id INTEGER          NULL REFERENCES tasks (id) ON DELETE RESTRICT,
    title          VARCHAR(500) NOT NULL,
    description    VARCHAR(4000)    NULL,
    status         VARCHAR(50)  NOT NULL,
    is_invoiced    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ  NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_tasks_project_id     ON tasks (project_id);
CREATE INDEX IF NOT EXISTS ix_tasks_parent_task_id ON tasks (parent_task_id);

-- ============================================================
-- TimeEntries  (top-level tasks only; enforced in application)
-- ============================================================
CREATE TABLE IF NOT EXISTS time_entries (
    id         INTEGER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    task_id    INTEGER        NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    hours      NUMERIC(10, 2) NOT NULL,
    date       TIMESTAMPTZ    NOT NULL,
    notes      TEXT               NULL,
    created_at TIMESTAMPTZ    NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_time_entries_task_id ON time_entries (task_id);

-- ============================================================
-- SystemSettings  (one row per tenant)
-- ============================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id                    INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id             INTEGER      NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
    company_name          VARCHAR(200)     NULL,
    company_address       VARCHAR(1000)    NULL,
    next_invoice_sequence INTEGER      NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS ix_system_settings_tenant_id ON system_settings (tenant_id);

-- ============================================================
-- Invoices
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
    id             INTEGER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id     INTEGER        NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    invoice_number VARCHAR(50)    NOT NULL,
    company_name   VARCHAR(200)       NULL,
    client_name    VARCHAR(200)       NULL,
    client_address VARCHAR(1000)      NULL,
    due_date       TIMESTAMPTZ        NULL,
    tax_rate       NUMERIC(5, 2)  NOT NULL DEFAULT 0,
    notes          TEXT               NULL,
    status         VARCHAR(50)    NOT NULL,
    created_at     TIMESTAMPTZ    NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_invoices_project_id ON invoices (project_id);

-- ============================================================
-- InvoiceLineItems
-- ============================================================
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id          INTEGER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_id  INTEGER        NOT NULL REFERENCES invoices (id) ON DELETE CASCADE,
    task_id     INTEGER        NOT NULL REFERENCES tasks (id) ON DELETE RESTRICT,
    description VARCHAR(500)   NOT NULL,
    hours       NUMERIC(10, 2) NOT NULL,
    hourly_rate NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_invoice_line_items_invoice_id ON invoice_line_items (invoice_id);
CREATE INDEX IF NOT EXISTS ix_invoice_line_items_task_id    ON invoice_line_items (task_id);

-- ============================================================
-- EF Core migrations history  (Npgsql naming convention)
-- ============================================================
CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId"    VARCHAR(150) NOT NULL,
    "ProductVersion" VARCHAR(32)  NOT NULL,

    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

-- Mark all migrations as applied so dotnet ef does not re-run them.
-- After running "dotnet ef migrations add AddAuthAndMultiTenant", replace
-- the placeholder ID below with the generated timestamp-prefixed name.
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
SELECT src."MigrationId", src."ProductVersion"
FROM (VALUES
    ('20260504235106_initial',               '9.0.0'),
    ('20260505023210_AddInvoicesAdvanced',   '9.0.0'),
    ('20260505024514_AddInvoiceDetails',     '9.0.0'),
    ('YYYYMMDDHHMMSS_AddAuthAndMultiTenant', '10.0.0')
) AS src ("MigrationId", "ProductVersion")
WHERE NOT EXISTS (
    SELECT 1 FROM "__EFMigrationsHistory" h
    WHERE h."MigrationId" = src."MigrationId"
);
