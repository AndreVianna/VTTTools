#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class IgnoreNamedSizeName : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AlterColumn<string>(
            name: "Name",
            table: "Users",
            type: "text",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(128)",
            oldMaxLength: 128);

        migrationBuilder.AlterColumn<string>(
            name: "Email",
            table: "Users",
            type: "character varying(256)",
            maxLength: 256,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "character varying(256)",
            oldMaxLength: 256);

        migrationBuilder.AlterColumn<string>(
            name: "DisplayName",
            table: "Users",
            type: "text",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(32)",
            oldMaxLength: 32);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.AlterColumn<string>(
            name: "Name",
            table: "Users",
            type: "character varying(128)",
            maxLength: 128,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "text");

        migrationBuilder.AlterColumn<string>(
            name: "Email",
            table: "Users",
            type: "character varying(256)",
            maxLength: 256,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "character varying(256)",
            oldMaxLength: 256,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "DisplayName",
            table: "Users",
            type: "character varying(32)",
            maxLength: 32,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "text");
    }
}
