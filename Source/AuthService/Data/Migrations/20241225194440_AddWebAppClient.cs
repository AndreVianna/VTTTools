using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuthService.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddWebAppClient : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    HashedSecret = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Clients",
                columns: new[] { "Id", "HashedSecret" },
                values: new object[] { "VttToolsWebApp", "AQAAAAIAAYagAAAAEDutt3FAy41C6n8dL7T9pqHWJbgOX8J/Fan4cSPw/SMA95gpziNIsQGYD6/PorZUTw==" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Clients");
        }
    }
}
