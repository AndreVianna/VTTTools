using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class ChangeSceneAssetPositionToDouble : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AlterColumn<double>(
            name: "Position_Y",
            table: "SceneAssets",
            type: "float",
            nullable: false,
            defaultValue: 0.0,
            oldClrType: typeof(int),
            oldType: "int",
            oldDefaultValue: 0);

        migrationBuilder.AlterColumn<double>(
            name: "Position_X",
            table: "SceneAssets",
            type: "float",
            nullable: false,
            defaultValue: 0.0,
            oldClrType: typeof(int),
            oldType: "int",
            oldDefaultValue: 0);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.AlterColumn<int>(
            name: "Position_Y",
            table: "SceneAssets",
            type: "int",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(double),
            oldType: "float",
            oldDefaultValue: 0.0);

        migrationBuilder.AlterColumn<int>(
            name: "Position_X",
            table: "SceneAssets",
            type: "int",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(double),
            oldType: "float",
            oldDefaultValue: 0.0);
    }
}