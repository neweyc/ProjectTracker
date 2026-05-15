using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectTracker.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionTierToTenant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SubscriptionTier",
                table: "Tenants",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Free");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SubscriptionTier",
                table: "Tenants");
        }
    }
}
