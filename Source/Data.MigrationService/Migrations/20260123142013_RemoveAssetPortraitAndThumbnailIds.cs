using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VttTools.Data.MigrationService.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAssetPortraitAndThumbnailIds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assets_Resources_PortraitId",
                table: "Assets");

            migrationBuilder.DropForeignKey(
                name: "FK_Assets_Resources_ThumbnailId",
                table: "Assets");

            migrationBuilder.DropIndex(
                name: "IX_Assets_PortraitId",
                table: "Assets");

            migrationBuilder.DropIndex(
                name: "IX_Assets_ThumbnailId",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "PortraitId",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "ThumbnailId",
                table: "Assets");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PortraitId",
                table: "Assets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ThumbnailId",
                table: "Assets",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Assets_PortraitId",
                table: "Assets",
                column: "PortraitId");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_ThumbnailId",
                table: "Assets",
                column: "ThumbnailId");

            migrationBuilder.AddForeignKey(
                name: "FK_Assets_Resources_PortraitId",
                table: "Assets",
                column: "PortraitId",
                principalTable: "Resources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Assets_Resources_ThumbnailId",
                table: "Assets",
                column: "ThumbnailId",
                principalTable: "Resources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
