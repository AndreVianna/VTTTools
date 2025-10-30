#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class MakeAdventureResourceOptional : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) => migrationBuilder.AlterColumn<Guid>(
            name: "BackgroundId",
            table: "Adventures",
            type: "uniqueidentifier",
            nullable: true,
            oldClrType: typeof(Guid),
            oldType: "uniqueidentifier");

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.AlterColumn<Guid>(
            name: "BackgroundId",
            table: "Adventures",
            type: "uniqueidentifier",
            nullable: false,
            defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
            oldClrType: typeof(Guid),
            oldType: "uniqueidentifier",
            oldNullable: true);
}