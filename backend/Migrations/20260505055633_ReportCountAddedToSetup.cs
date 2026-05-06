using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class ReportCountAddedToSetup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReportCount",
                table: "Battles");

            migrationBuilder.AddColumn<int>(
                name: "ReportCount",
                table: "Setups",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReportCount",
                table: "Setups");

            migrationBuilder.AddColumn<int>(
                name: "ReportCount",
                table: "Battles",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
