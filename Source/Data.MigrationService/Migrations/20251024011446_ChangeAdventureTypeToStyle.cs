#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class ChangeAdventureTypeToStyle : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) => migrationBuilder.RenameColumn(
            name: "Type",
            table: "Adventures",
            newName: "Style");

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.RenameColumn(
            name: "Style",
            table: "Adventures",
            newName: "Type");
}