#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class RemoveProcessingStatusFromResources : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropColumn(
            name: "ProcessingError",
            table: "Resources");

        migrationBuilder.DropColumn(
            name: "ProcessingStatus",
            table: "Resources");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.AddColumn<string>(
            name: "ProcessingError",
            table: "Resources",
            type: "character varying(512)",
            maxLength: 512,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "ProcessingStatus",
            table: "Resources",
            type: "text",
            nullable: false,
            defaultValue: "Pending");
    }
}