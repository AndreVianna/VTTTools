#nullable disable

namespace ApiService.Data.Migrations;

/// <inheritdoc />
public partial class CreateInitialSchema : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
        => migrationBuilder.CreateTable(
            name: "Clients",
            columns: table => new {
                Id = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                HashedSecret = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Clients", x => x.Id));

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
        => migrationBuilder.DropTable(name: "Clients");
}
