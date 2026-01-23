#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class AddIngestFields : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AddColumn<Guid>(
            name: "AssetId",
            table: "JobItems",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "AiPrompt",
            table: "Assets",
            type: "character varying(4096)",
            maxLength: 4096,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "IngestStatus",
            table: "Assets",
            type: "text",
            nullable: false,
            defaultValue: "None");

        migrationBuilder.CreateIndex(
            name: "IX_JobItems_AssetId",
            table: "JobItems",
            column: "AssetId");

        migrationBuilder.CreateIndex(
            name: "IX_Assets_IngestStatus",
            table: "Assets",
            column: "IngestStatus");

        migrationBuilder.AddForeignKey(
            name: "FK_JobItems_Assets_AssetId",
            table: "JobItems",
            column: "AssetId",
            principalTable: "Assets",
            principalColumn: "Id",
            onDelete: ReferentialAction.SetNull);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropForeignKey(
            name: "FK_JobItems_Assets_AssetId",
            table: "JobItems");

        migrationBuilder.DropIndex(
            name: "IX_JobItems_AssetId",
            table: "JobItems");

        migrationBuilder.DropIndex(
            name: "IX_Assets_IngestStatus",
            table: "Assets");

        migrationBuilder.DropColumn(
            name: "AssetId",
            table: "JobItems");

        migrationBuilder.DropColumn(
            name: "AiPrompt",
            table: "Assets");

        migrationBuilder.DropColumn(
            name: "IngestStatus",
            table: "Assets");
    }
}
