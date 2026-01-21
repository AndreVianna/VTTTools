#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class AddResourceMetadataFields : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AddColumn<string>(
            name: "Description",
            table: "Resources",
            type: "character varying(1024)",
            maxLength: 1024,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "Name",
            table: "Resources",
            type: "character varying(256)",
            maxLength: 256,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "Tags",
            table: "Resources",
            type: "jsonb",
            nullable: false,
            defaultValueSql: "'[]'::jsonb");

        migrationBuilder.CreateIndex(
            name: "IX_Resources_Tags",
            table: "Resources",
            column: "Tags")
            .Annotation("Npgsql:IndexMethod", "gin");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropIndex(
            name: "IX_Resources_Tags",
            table: "Resources");

        migrationBuilder.DropColumn(
            name: "Description",
            table: "Resources");

        migrationBuilder.DropColumn(
            name: "Name",
            table: "Resources");

        migrationBuilder.DropColumn(
            name: "Tags",
            table: "Resources");
    }
}