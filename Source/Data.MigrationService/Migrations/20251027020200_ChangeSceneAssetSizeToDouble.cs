#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class ChangeSceneAssetSizeToDouble : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AlterColumn<double>(
            name: "Size_Width",
            table: "SceneAssets",
            type: "float",
            nullable: false,
            defaultValue: 0.0,
            oldClrType: typeof(int),
            oldType: "int",
            oldDefaultValue: 0);

        migrationBuilder.AlterColumn<double>(
            name: "Size_Height",
            table: "SceneAssets",
            type: "float",
            nullable: false,
            defaultValue: 0.0,
            oldClrType: typeof(int),
            oldType: "int",
            oldDefaultValue: 0);

        migrationBuilder.AddColumn<bool>(
            name: "Size_IsSquare",
            table: "SceneAssets",
            type: "bit",
            nullable: false,
            defaultValue: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropColumn(
            name: "Size_IsSquare",
            table: "SceneAssets");

        migrationBuilder.AlterColumn<int>(
            name: "Size_Width",
            table: "SceneAssets",
            type: "int",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(double),
            oldType: "float",
            oldDefaultValue: 0.0);

        migrationBuilder.AlterColumn<int>(
            name: "Size_Height",
            table: "SceneAssets",
            type: "int",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(double),
            oldType: "float",
            oldDefaultValue: 0.0);
    }
}