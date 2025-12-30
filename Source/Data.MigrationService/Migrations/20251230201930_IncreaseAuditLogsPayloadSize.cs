using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VttTools.Data.MigrationService.Migrations
{
    /// <inheritdoc />
    public partial class IncreaseAuditLogsPayloadSize : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<List<int>>(
                name: "Recurrence_Days",
                table: "Schedule",
                type: "integer[]",
                nullable: false,
                defaultValue: new List<int>(),
                oldClrType: typeof(List<int>),
                oldType: "integer[]",
                oldDefaultValue: new List<int>());

            migrationBuilder.AlterColumn<string>(
                name: "Payload",
                table: "AuditLogs",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(8000)",
                oldMaxLength: 8000,
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<List<int>>(
                name: "Recurrence_Days",
                table: "Schedule",
                type: "integer[]",
                nullable: false,
                defaultValue: new List<int>(),
                oldClrType: typeof(List<int>),
                oldType: "integer[]",
                oldDefaultValue: new List<int>());

            migrationBuilder.AlterColumn<string>(
                name: "Payload",
                table: "AuditLogs",
                type: "character varying(8000)",
                maxLength: 8000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
