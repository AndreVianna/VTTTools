using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class AddContentIndex : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.CreateIndex(
            name: "IX_Adventures_Id",
            table: "Adventures",
            column: "Id",
            descending: new[] { true });

        migrationBuilder.CreateIndex(
            name: "IX_Campaigns_Id",
            table: "Campaigns",
            column: "Id",
            descending: new[] { true });

        migrationBuilder.CreateIndex(
            name: "IX_Epics_Id",
            table: "Epics",
            column: "Id",
            descending: new[] { true });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropIndex(
            name: "IX_Epics_Id",
            table: "Epics");

        migrationBuilder.DropIndex(
            name: "IX_Campaigns_Id",
            table: "Campaigns");

        migrationBuilder.DropIndex(
            name: "IX_Adventures_Id",
            table: "Adventures");
    }
}