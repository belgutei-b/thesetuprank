using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class RemovedVoteModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Votes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Votes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BattleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LoserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WinnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Votes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Votes_Battles_BattleId",
                        column: x => x.BattleId,
                        principalTable: "Battles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Votes_Setups_LoserId",
                        column: x => x.LoserId,
                        principalTable: "Setups",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Votes_Setups_WinnerId",
                        column: x => x.WinnerId,
                        principalTable: "Setups",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Votes_BattleId",
                table: "Votes",
                column: "BattleId");

            migrationBuilder.CreateIndex(
                name: "IX_Votes_LoserId",
                table: "Votes",
                column: "LoserId");

            migrationBuilder.CreateIndex(
                name: "IX_Votes_WinnerId",
                table: "Votes",
                column: "WinnerId");
        }
    }
}
