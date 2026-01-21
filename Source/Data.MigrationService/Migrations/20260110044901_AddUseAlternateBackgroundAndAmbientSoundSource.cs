#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class AddUseAlternateBackgroundAndAmbientSoundSource : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AddColumn<string>(
            name: "AmbientSoundSource",
            table: "Stages",
            type: "text",
            nullable: false,
            defaultValue: "NotSet");

        migrationBuilder.AddColumn<bool>(
            name: "UseAlternateBackground",
            table: "Stages",
            type: "boolean",
            nullable: false,
            defaultValue: false);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropColumn(
            name: "AmbientSoundSource",
            table: "Stages");

        migrationBuilder.DropColumn(
            name: "UseAlternateBackground",
            table: "Stages");
    }
}