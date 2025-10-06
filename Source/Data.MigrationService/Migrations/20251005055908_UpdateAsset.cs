using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VttTools.Data.MigrationService.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAsset : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assets_Resources_DisplayId",
                table: "Assets");

            migrationBuilder.DropForeignKey(
                name: "FK_Campaigns_Resources_DisplayId",
                table: "Campaigns");

            migrationBuilder.DropForeignKey(
                name: "FK_Epics_Resources_DisplayId",
                table: "Epics");

            migrationBuilder.DropForeignKey(
                name: "FK_SceneAssets_Resources_DisplayId",
                table: "SceneAssets");

            migrationBuilder.DropIndex(
                name: "IX_Assets_DisplayId",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "DisplayId",
                table: "Assets");

            migrationBuilder.RenameColumn(
                name: "DisplayId",
                table: "SceneAssets",
                newName: "ResourceId");

            migrationBuilder.RenameIndex(
                name: "IX_SceneAssets_DisplayId",
                table: "SceneAssets",
                newName: "IX_SceneAssets_ResourceId");

            migrationBuilder.RenameColumn(
                name: "DisplayId",
                table: "Epics",
                newName: "ResourceId");

            migrationBuilder.RenameIndex(
                name: "IX_Epics_DisplayId",
                table: "Epics",
                newName: "IX_Epics_ResourceId");

            migrationBuilder.RenameColumn(
                name: "DisplayId",
                table: "Campaigns",
                newName: "ResourceId");

            migrationBuilder.RenameIndex(
                name: "IX_Campaigns_DisplayId",
                table: "Campaigns",
                newName: "IX_Campaigns_ResourceId");

            migrationBuilder.AddColumn<int>(
                name: "Category",
                table: "Assets",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "ResourceId",
                table: "Assets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Assets_ResourceId",
                table: "Assets",
                column: "ResourceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Assets_Resources_ResourceId",
                table: "Assets",
                column: "ResourceId",
                principalTable: "Resources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Campaigns_Resources_ResourceId",
                table: "Campaigns",
                column: "ResourceId",
                principalTable: "Resources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Epics_Resources_ResourceId",
                table: "Epics",
                column: "ResourceId",
                principalTable: "Resources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SceneAssets_Resources_ResourceId",
                table: "SceneAssets",
                column: "ResourceId",
                principalTable: "Resources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assets_Resources_ResourceId",
                table: "Assets");

            migrationBuilder.DropForeignKey(
                name: "FK_Campaigns_Resources_ResourceId",
                table: "Campaigns");

            migrationBuilder.DropForeignKey(
                name: "FK_Epics_Resources_ResourceId",
                table: "Epics");

            migrationBuilder.DropForeignKey(
                name: "FK_SceneAssets_Resources_ResourceId",
                table: "SceneAssets");

            migrationBuilder.DropIndex(
                name: "IX_Assets_ResourceId",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "ResourceId",
                table: "Assets");

            migrationBuilder.RenameColumn(
                name: "ResourceId",
                table: "SceneAssets",
                newName: "DisplayId");

            migrationBuilder.RenameIndex(
                name: "IX_SceneAssets_ResourceId",
                table: "SceneAssets",
                newName: "IX_SceneAssets_DisplayId");

            migrationBuilder.RenameColumn(
                name: "ResourceId",
                table: "Epics",
                newName: "DisplayId");

            migrationBuilder.RenameIndex(
                name: "IX_Epics_ResourceId",
                table: "Epics",
                newName: "IX_Epics_DisplayId");

            migrationBuilder.RenameColumn(
                name: "ResourceId",
                table: "Campaigns",
                newName: "DisplayId");

            migrationBuilder.RenameIndex(
                name: "IX_Campaigns_ResourceId",
                table: "Campaigns",
                newName: "IX_Campaigns_DisplayId");

            migrationBuilder.AddColumn<Guid>(
                name: "DisplayId",
                table: "Assets",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Assets_DisplayId",
                table: "Assets",
                column: "DisplayId");

            migrationBuilder.AddForeignKey(
                name: "FK_Assets_Resources_DisplayId",
                table: "Assets",
                column: "DisplayId",
                principalTable: "Resources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Campaigns_Resources_DisplayId",
                table: "Campaigns",
                column: "DisplayId",
                principalTable: "Resources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Epics_Resources_DisplayId",
                table: "Epics",
                column: "DisplayId",
                principalTable: "Resources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SceneAssets_Resources_DisplayId",
                table: "SceneAssets",
                column: "DisplayId",
                principalTable: "Resources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
