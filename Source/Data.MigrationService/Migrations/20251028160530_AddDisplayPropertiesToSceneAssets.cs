#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class AddDisplayPropertiesToSceneAssets : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AddColumn<string>(
            name: "DefaultDisplayName",
            table: "Scenes",
            type: "nvarchar(max)",
            nullable: false,
            defaultValue: "Always");

        migrationBuilder.AddColumn<string>(
            name: "DefaultLabelPosition",
            table: "Scenes",
            type: "nvarchar(max)",
            nullable: false,
            defaultValue: "Bottom");

        migrationBuilder.AddColumn<string>(
            name: "DisplayName",
            table: "SceneAssets",
            type: "nvarchar(max)",
            nullable: false,
            defaultValue: "Default");

        migrationBuilder.AddColumn<string>(
            name: "LabelPosition",
            table: "SceneAssets",
            type: "nvarchar(max)",
            nullable: false,
            defaultValue: "Default");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropColumn(
            name: "DefaultDisplayName",
            table: "Scenes");

        migrationBuilder.DropColumn(
            name: "DefaultLabelPosition",
            table: "Scenes");

        migrationBuilder.DropColumn(
            name: "DisplayName",
            table: "SceneAssets");

        migrationBuilder.DropColumn(
            name: "LabelPosition",
            table: "SceneAssets");
    }
}