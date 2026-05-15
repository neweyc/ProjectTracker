-- Olive Invoice Schema
-- SQL Server / Azure SQL
-- Run this script against an empty database to create the full schema.
-- The __EFMigrationsHistory rows prevent dotnet ef from re-running migrations
-- against a manually-created database.
--
-- Table creation order respects foreign key dependencies:
--   Tenants -> Users -> ExternalLogins
--   Tenants -> Projects -> Tasks -> TimeEntries
--                       -> InvoiceLineItems
--                       -> Invoices -> InvoiceLineItems
--   Tenants -> SystemSettings

-- ============================================================
-- Tenants
-- ============================================================
IF OBJECT_ID(N'dbo.Tenants', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Tenants
    (
        Id                   INT           NOT NULL IDENTITY(1,1),
        Name                 NVARCHAR(200) NOT NULL,
        Slug                 NVARCHAR(100) NOT NULL,
        CreatedAt            DATETIME2     NOT NULL,
        StripeCustomerId     NVARCHAR(100)     NULL,
        StripeSubscriptionId NVARCHAR(100)     NULL,
        SubscriptionStatus   NVARCHAR(50)      NULL,

        CONSTRAINT PK_Tenants PRIMARY KEY (Id)
    );

    CREATE UNIQUE INDEX UX_Tenants_Slug ON dbo.Tenants (Slug);
END;
GO

-- ============================================================
-- Users
-- ============================================================
IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users
    (
        Id           INT           NOT NULL IDENTITY(1,1),
        TenantId     INT           NOT NULL,
        Email        NVARCHAR(256) NOT NULL,
        DisplayName  NVARCHAR(200) NOT NULL,
        PasswordHash NVARCHAR(500)     NULL,   -- NULL for OAuth-only accounts
        CreatedAt    DATETIME2     NOT NULL,

        CONSTRAINT PK_Users PRIMARY KEY (Id),

        CONSTRAINT FK_Users_Tenants_TenantId
            FOREIGN KEY (TenantId)
            REFERENCES dbo.Tenants (Id)
            ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX UX_Users_Email ON dbo.Users (Email);
END;
GO

-- ============================================================
-- ExternalLogins  (Google, GitHub, etc.)
-- ============================================================
IF OBJECT_ID(N'dbo.ExternalLogins', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ExternalLogins
    (
        Id                INT           NOT NULL IDENTITY(1,1),
        UserId            INT           NOT NULL,
        Provider          NVARCHAR(50)  NOT NULL,   -- "google", "github", etc.
        ProviderSubjectId NVARCHAR(256) NOT NULL,   -- OIDC "sub" claim
        CreatedAt         DATETIME2     NOT NULL,

        CONSTRAINT PK_ExternalLogins PRIMARY KEY (Id),

        CONSTRAINT FK_ExternalLogins_Users_UserId
            FOREIGN KEY (UserId)
            REFERENCES dbo.Users (Id)
            ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX UX_ExternalLogins_Provider_SubjectId
        ON dbo.ExternalLogins (Provider, ProviderSubjectId);
END;
GO

-- ============================================================
-- Projects
-- ============================================================
IF OBJECT_ID(N'dbo.Projects', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Projects
    (
        Id          INT            NOT NULL IDENTITY(1,1),
        TenantId    INT            NOT NULL,
        Name        NVARCHAR(200)  NOT NULL,
        Description NVARCHAR(2000)     NULL,
        CreatedAt   DATETIME2      NOT NULL,

        CONSTRAINT PK_Projects PRIMARY KEY (Id),

        CONSTRAINT FK_Projects_Tenants_TenantId
            FOREIGN KEY (TenantId)
            REFERENCES dbo.Tenants (Id)
            ON DELETE CASCADE
    );

    CREATE INDEX IX_Projects_TenantId ON dbo.Projects (TenantId);
END;
GO

-- ============================================================
-- Tasks  (self-referencing: subtasks point back to a parent)
-- ============================================================
IF OBJECT_ID(N'dbo.Tasks', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Tasks
    (
        Id           INT            NOT NULL IDENTITY(1,1),
        ProjectId    INT            NOT NULL,
        ParentTaskId INT                NULL,
        Title        NVARCHAR(500)  NOT NULL,
        Description  NVARCHAR(4000)     NULL,
        Status       NVARCHAR(50)   NOT NULL,
        IsInvoiced   BIT            NOT NULL,
        CreatedAt    DATETIME2      NOT NULL,

        CONSTRAINT PK_Tasks PRIMARY KEY (Id),

        CONSTRAINT FK_Tasks_Projects_ProjectId
            FOREIGN KEY (ProjectId)
            REFERENCES dbo.Projects (Id)
            ON DELETE CASCADE,

        CONSTRAINT FK_Tasks_Tasks_ParentTaskId
            FOREIGN KEY (ParentTaskId)
            REFERENCES dbo.Tasks (Id)
            ON DELETE NO ACTION   -- RESTRICT: prevents orphaned-subtask cycles
    );

    CREATE INDEX IX_Tasks_ProjectId    ON dbo.Tasks (ProjectId);
    CREATE INDEX IX_Tasks_ParentTaskId ON dbo.Tasks (ParentTaskId);
END;
GO

-- ============================================================
-- TimeEntries  (top-level tasks only; enforced in application)
-- ============================================================
IF OBJECT_ID(N'dbo.TimeEntries', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TimeEntries
    (
        Id        INT            NOT NULL IDENTITY(1,1),
        TaskId    INT            NOT NULL,
        Hours     DECIMAL(10,2)  NOT NULL,
        Date      DATETIME2      NOT NULL,
        Notes     NVARCHAR(MAX)      NULL,
        CreatedAt DATETIME2      NOT NULL,

        CONSTRAINT PK_TimeEntries PRIMARY KEY (Id),

        CONSTRAINT FK_TimeEntries_Tasks_TaskId
            FOREIGN KEY (TaskId)
            REFERENCES dbo.Tasks (Id)
            ON DELETE CASCADE
    );

    CREATE INDEX IX_TimeEntries_TaskId ON dbo.TimeEntries (TaskId);
END;
GO

-- ============================================================
-- SystemSettings  (one row per tenant)
-- ============================================================
IF OBJECT_ID(N'dbo.SystemSettings', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SystemSettings
    (
        Id                  INT            NOT NULL IDENTITY(1,1),
        TenantId            INT            NOT NULL,
        CompanyName         NVARCHAR(200)      NULL,
        CompanyAddress      NVARCHAR(1000)     NULL,
        NextInvoiceSequence INT            NOT NULL DEFAULT 1,

        CONSTRAINT PK_SystemSettings PRIMARY KEY (Id),

        CONSTRAINT FK_SystemSettings_Tenants_TenantId
            FOREIGN KEY (TenantId)
            REFERENCES dbo.Tenants (Id)
            ON DELETE CASCADE
    );

    CREATE INDEX IX_SystemSettings_TenantId ON dbo.SystemSettings (TenantId);
END;
GO

-- ============================================================
-- Invoices
-- ============================================================
IF OBJECT_ID(N'dbo.Invoices', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Invoices
    (
        Id            INT            NOT NULL IDENTITY(1,1),
        ProjectId     INT            NOT NULL,
        InvoiceNumber NVARCHAR(50)   NOT NULL,
        CompanyName   NVARCHAR(200)      NULL,
        ClientName    NVARCHAR(200)      NULL,
        ClientAddress NVARCHAR(1000)     NULL,
        DueDate       DATETIME2          NULL,
        TaxRate       DECIMAL(5,2)   NOT NULL DEFAULT 0,
        Notes         NVARCHAR(MAX)      NULL,
        Status        NVARCHAR(50)   NOT NULL,
        CreatedAt     DATETIME2      NOT NULL,

        CONSTRAINT PK_Invoices PRIMARY KEY (Id),

        CONSTRAINT FK_Invoices_Projects_ProjectId
            FOREIGN KEY (ProjectId)
            REFERENCES dbo.Projects (Id)
            ON DELETE CASCADE
    );

    CREATE INDEX IX_Invoices_ProjectId ON dbo.Invoices (ProjectId);
END;
GO

-- ============================================================
-- InvoiceLineItems
-- ============================================================
IF OBJECT_ID(N'dbo.InvoiceLineItems', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.InvoiceLineItems
    (
        Id          INT            NOT NULL IDENTITY(1,1),
        InvoiceId   INT            NOT NULL,
        TaskId      INT            NOT NULL,
        Description NVARCHAR(500)  NOT NULL,
        Hours       DECIMAL(10,2)  NOT NULL,
        HourlyRate  DECIMAL(10,2)  NOT NULL,

        CONSTRAINT PK_InvoiceLineItems PRIMARY KEY (Id),

        CONSTRAINT FK_InvoiceLineItems_Invoices_InvoiceId
            FOREIGN KEY (InvoiceId)
            REFERENCES dbo.Invoices (Id)
            ON DELETE CASCADE,

        CONSTRAINT FK_InvoiceLineItems_Tasks_TaskId
            FOREIGN KEY (TaskId)
            REFERENCES dbo.Tasks (Id)
            ON DELETE NO ACTION
    );

    CREATE INDEX IX_InvoiceLineItems_InvoiceId ON dbo.InvoiceLineItems (InvoiceId);
    CREATE INDEX IX_InvoiceLineItems_TaskId    ON dbo.InvoiceLineItems (TaskId);
END;
GO

-- ============================================================
-- EF Core migrations history
-- ============================================================
IF OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.__EFMigrationsHistory
    (
        MigrationId    NVARCHAR(150) NOT NULL,
        ProductVersion NVARCHAR(32)  NOT NULL,

        CONSTRAINT PK___EFMigrationsHistory PRIMARY KEY (MigrationId)
    );
END;
GO

-- Mark all migrations as applied so dotnet ef does not re-run them.
-- After running "dotnet ef migrations add AddAuthAndMultiTenant", replace
-- the placeholder ID below with the generated timestamp-prefixed name.
INSERT INTO dbo.__EFMigrationsHistory (MigrationId, ProductVersion)
SELECT src.MigrationId, src.ProductVersion
FROM (VALUES
    (N'20260504235106_initial',               N'9.0.0'),
    (N'20260505023210_AddInvoicesAdvanced',   N'9.0.0'),
    (N'20260505024514_AddInvoiceDetails',     N'9.0.0'),
    (N'YYYYMMDDHHMMSS_AddAuthAndMultiTenant', N'10.0.0')
) AS src (MigrationId, ProductVersion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.__EFMigrationsHistory h
    WHERE h.MigrationId = src.MigrationId
);
GO
