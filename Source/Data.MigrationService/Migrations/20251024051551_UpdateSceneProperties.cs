#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class UpdateSceneProperties : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropColumn(
            name: "OwnerId",
            table: "Scenes");

        migrationBuilder.AlterColumn<Guid>(
            name: "AdventureId",
            table: "Scenes",
            type: "uniqueidentifier",
            nullable: false,
            defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
            oldClrType: typeof(Guid),
            oldType: "uniqueidentifier",
            oldNullable: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.AlterColumn<Guid>(
            name: "AdventureId",
            table: "Scenes",
            type: "uniqueidentifier",
            nullable: true,
            oldClrType: typeof(Guid),
            oldType: "uniqueidentifier");

        migrationBuilder.AddColumn<Guid>(
            name: "OwnerId",
            table: "Scenes",
            type: "uniqueidentifier",
            nullable: false,
            defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
    }
}