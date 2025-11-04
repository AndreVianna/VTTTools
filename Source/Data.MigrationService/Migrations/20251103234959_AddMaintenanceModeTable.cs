#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class AddMaintenanceModeTable : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.CreateTable(
            name: "MaintenanceMode",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                IsEnabled = table.Column<bool>(type: "BIT", nullable: false, defaultValue: false),
                Message = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                ScheduledStartTime = table.Column<DateTime>(type: "DATETIME2", nullable: true),
                ScheduledEndTime = table.Column<DateTime>(type: "DATETIME2", nullable: true),
                EnabledAt = table.Column<DateTime>(type: "DATETIME2", nullable: true),
                EnabledBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                DisabledAt = table.Column<DateTime>(type: "DATETIME2", nullable: true),
                DisabledBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
            },
            constraints: table => table.PrimaryKey("PK_MaintenanceMode", x => x.Id));

        migrationBuilder.CreateIndex(
            name: "IX_MaintenanceMode_EnabledBy",
            table: "MaintenanceMode",
            column: "EnabledBy");

        migrationBuilder.CreateIndex(
            name: "IX_MaintenanceMode_IsEnabled",
            table: "MaintenanceMode",
            column: "IsEnabled");

        migrationBuilder.CreateIndex(
            name: "IX_MaintenanceMode_IsEnabled_ScheduledStartTime",
            table: "MaintenanceMode",
            columns: ["IsEnabled", "ScheduledStartTime"]);

        migrationBuilder.CreateIndex(
            name: "IX_MaintenanceMode_ScheduledEndTime",
            table: "MaintenanceMode",
            column: "ScheduledEndTime");

        migrationBuilder.CreateIndex(
            name: "IX_MaintenanceMode_ScheduledStartTime",
            table: "MaintenanceMode",
            column: "ScheduledStartTime");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.DropTable(
            name: "MaintenanceMode");
}
