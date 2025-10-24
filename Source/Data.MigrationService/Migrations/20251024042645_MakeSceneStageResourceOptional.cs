using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VttTools.Data.MigrationService.Migrations
{
    /// <inheritdoc />
    public partial class MakeSceneStageResourceOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Scenes_Resources_StageId",
                table: "Scenes");

            migrationBuilder.DropIndex(
                name: "IX_Scenes_StageId",
                table: "Scenes");

            migrationBuilder.DropColumn(
                name: "StageId",
                table: "Scenes");

            migrationBuilder.AddColumn<Guid>(
                name: "BackgroundId",
                table: "Scenes",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Scenes_BackgroundId",
                table: "Scenes",
                column: "BackgroundId");

            migrationBuilder.AddForeignKey(
                name: "FK_Scenes_Resources_BackgroundId",
                table: "Scenes",
                column: "BackgroundId",
                principalTable: "Resources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Scenes_Resources_BackgroundId",
                table: "Scenes");

            migrationBuilder.DropIndex(
                name: "IX_Scenes_BackgroundId",
                table: "Scenes");

            migrationBuilder.DropColumn(
                name: "BackgroundId",
                table: "Scenes");

            migrationBuilder.AddColumn<Guid>(
                name: "StageId",
                table: "Scenes",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Scenes_StageId",
                table: "Scenes",
                column: "StageId");

            migrationBuilder.AddForeignKey(
                name: "FK_Scenes_Resources_StageId",
                table: "Scenes",
                column: "StageId",
                principalTable: "Resources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
