using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureUserSetupCascades : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Setups_CreatedBy",
                table: "Setups",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_SavedSetups_UserId",
                table: "SavedSetups",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_SavedSetups_Users_UserId",
                table: "SavedSetups",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Setups_Users_CreatedBy",
                table: "Setups",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SavedSetups_Users_UserId",
                table: "SavedSetups");

            migrationBuilder.DropForeignKey(
                name: "FK_Setups_Users_CreatedBy",
                table: "Setups");

            migrationBuilder.DropIndex(
                name: "IX_Setups_CreatedBy",
                table: "Setups");

            migrationBuilder.DropIndex(
                name: "IX_SavedSetups_UserId",
                table: "SavedSetups");
        }
    }
}
