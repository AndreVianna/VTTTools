#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class UpdateSceneSourceSchema : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AlterColumn<string>(
            name: "Color",
            table: "SceneWalls",
            type: "nvarchar(32)",
            maxLength: 32,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "nvarchar(16)",
            oldMaxLength: 16,
            oldNullable: true);

        migrationBuilder.AlterColumn<float>(
            name: "Range",
            table: "SceneSources",
            type: "real",
            nullable: false,
            defaultValue: 0f,
            oldClrType: typeof(float),
            oldType: "real",
            oldNullable: true);

        migrationBuilder.AlterColumn<float>(
            name: "Intensity",
            table: "SceneSources",
            type: "real",
            nullable: false,
            defaultValue: 100f,
            oldClrType: typeof(float),
            oldType: "real",
            oldNullable: true);

        migrationBuilder.AddColumn<string>(
            name: "Color",
            table: "SceneSources",
            type: "nvarchar(32)",
            maxLength: 32,
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "IsDirectional",
            table: "SceneSources",
            type: "bit",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<float>(
            name: "Spread",
            table: "SceneSources",
            type: "real",
            nullable: false,
            defaultValue: 0f);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropColumn(
            name: "Color",
            table: "SceneSources");

        migrationBuilder.DropColumn(
            name: "IsDirectional",
            table: "SceneSources");

        migrationBuilder.DropColumn(
            name: "Spread",
            table: "SceneSources");

        migrationBuilder.AlterColumn<string>(
            name: "Color",
            table: "SceneWalls",
            type: "nvarchar(16)",
            maxLength: 16,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "nvarchar(32)",
            oldMaxLength: 32,
            oldNullable: true);

        migrationBuilder.AlterColumn<float>(
            name: "Range",
            table: "SceneSources",
            type: "real",
            nullable: true,
            oldClrType: typeof(float),
            oldType: "real",
            oldDefaultValue: 0f);

        migrationBuilder.AlterColumn<float>(
            name: "Intensity",
            table: "SceneSources",
            type: "real",
            nullable: true,
            oldClrType: typeof(float),
            oldType: "real",
            oldDefaultValue: 100f);
    }
}
