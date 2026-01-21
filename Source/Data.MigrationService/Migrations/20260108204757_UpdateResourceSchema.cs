#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class UpdateResourceSchema : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AddColumn<Guid>(
            name: "OwnerId",
            table: "Resources",
            type: "uuid",
            nullable: false,
            defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

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

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropColumn(
            name: "OwnerId",
            table: "Resources");

        migrationBuilder.DropColumn(
            name: "ProcessingError",
            table: "Resources");

        migrationBuilder.DropColumn(
            name: "ProcessingStatus",
            table: "Resources");
    }
}