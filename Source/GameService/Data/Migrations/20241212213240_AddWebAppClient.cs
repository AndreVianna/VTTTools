#nullable disable

namespace GameService.Data.Migrations;

/// <inheritdoc />
public partial class AddWebAppClient : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) => migrationBuilder.InsertData(
            table: "Clients",
            columns: ["Id", "HashedSecret"],
            values: ["VttToolsWebApp", "AQAAAAIAAYagAAAAEDutt3FAy41C6n8dL7T9pqHWJbgOX8J/Fan4cSPw/SMA95gpziNIsQGYD6/PorZUTw=="]);

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.DeleteData(
            table: "Clients",
            keyColumn: "Id",
            keyValue: "VttToolsWebApp");
}
