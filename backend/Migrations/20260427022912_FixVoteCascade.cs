using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class FixVoteCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Votes_Setups_LoserId",
                table: "Votes");

            migrationBuilder.DropForeignKey(
                name: "FK_Votes_Setups_WinnerId",
                table: "Votes");

            migrationBuilder.AddForeignKey(
                name: "FK_Votes_Setups_LoserId",
                table: "Votes",
                column: "LoserId",
                principalTable: "Setups",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Votes_Setups_WinnerId",
                table: "Votes",
                column: "WinnerId",
                principalTable: "Setups",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Votes_Setups_LoserId",
                table: "Votes");

            migrationBuilder.DropForeignKey(
                name: "FK_Votes_Setups_WinnerId",
                table: "Votes");

            migrationBuilder.AddForeignKey(
                name: "FK_Votes_Setups_LoserId",
                table: "Votes",
                column: "LoserId",
                principalTable: "Setups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Votes_Setups_WinnerId",
                table: "Votes",
                column: "WinnerId",
                principalTable: "Setups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
