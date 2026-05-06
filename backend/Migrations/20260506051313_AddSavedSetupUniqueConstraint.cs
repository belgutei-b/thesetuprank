using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSavedSetupUniqueConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SavedSetups_UserId",
                table: "SavedSetups");

            migrationBuilder.CreateIndex(
                name: "IX_SavedSetups_UserId_SetupId",
                table: "SavedSetups",
                columns: new[] { "UserId", "SetupId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SavedSetups_UserId_SetupId",
                table: "SavedSetups");

            migrationBuilder.CreateIndex(
                name: "IX_SavedSetups_UserId",
                table: "SavedSetups",
                column: "UserId");
        }
    }
}
