#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class AddUserAvatar : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AddColumn<Guid>(
            name: "AvatarResourceId",
            table: "Users",
            type: "uniqueidentifier",
            nullable: true);

        migrationBuilder.UpdateData(
            table: "Users",
            keyColumn: "Id",
            keyValue: new Guid("019639ea-c7de-7a01-8548-41edfccde206"),
            column: "AvatarResourceId",
            value: null);

        migrationBuilder.CreateIndex(
            name: "IX_Users_AvatarResourceId",
            table: "Users",
            column: "AvatarResourceId");

        migrationBuilder.AddForeignKey(
            name: "FK_Users_Resource_AvatarResourceId",
            table: "Users",
            column: "AvatarResourceId",
            principalTable: "Resource",
            principalColumn: "Id",
            onDelete: ReferentialAction.SetNull);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropForeignKey(
            name: "FK_Users_Resource_AvatarResourceId",
            table: "Users");

        migrationBuilder.DropIndex(
            name: "IX_Users_AvatarResourceId",
            table: "Users");

        migrationBuilder.DropColumn(
            name: "AvatarResourceId",
            table: "Users");
    }
}