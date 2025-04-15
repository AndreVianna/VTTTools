﻿using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VttTools.Data.Migrations
{
    /// <inheritdoc />
    public partial class CreateInitialGameSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Sessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ActiveMap = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SessionMaps",
                columns: table => new
                {
                    Number = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    MasterImageUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Size_Width = table.Column<int>(type: "int", nullable: false),
                    Size_Height = table.Column<int>(type: "int", nullable: false),
                    Grid_Offset_Left = table.Column<double>(type: "float", nullable: true),
                    Grid_Offset_Top = table.Column<double>(type: "float", nullable: true),
                    Grid_Cell_Width = table.Column<double>(type: "float", nullable: true),
                    Grid_Cell_Height = table.Column<double>(type: "float", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionMaps", x => new { x.SessionId, x.Number });
                    table.ForeignKey(
                        name: "FK_SessionMaps_Sessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "Sessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SessionMassages",
                columns: table => new
                {
                    SentAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SentBy = table.Column<int>(type: "int", nullable: false),
                    SentTo = table.Column<int>(type: "int", nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionMassages", x => new { x.SessionId, x.SentAt });
                    table.ForeignKey(
                        name: "FK_SessionMassages_Sessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "Sessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SessionPlayers",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionPlayers", x => new { x.SessionId, x.UserId });
                    table.ForeignKey(
                        name: "FK_SessionPlayers_Sessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "Sessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SessionMapTokens",
                columns: table => new
                {
                    Number = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MapNumber = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Position_Left = table.Column<int>(type: "int", nullable: false),
                    Position_Top = table.Column<int>(type: "int", nullable: false),
                    Size_Width = table.Column<int>(type: "int", nullable: false),
                    Size_Height = table.Column<int>(type: "int", nullable: false),
                    IsLocked = table.Column<bool>(type: "bit", maxLength: 256, nullable: false),
                    ControlledBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionMapTokens", x => new { x.SessionId, x.MapNumber, x.Number });
                    table.ForeignKey(
                        name: "FK_SessionMapTokens_SessionMaps_SessionId_MapNumber",
                        columns: x => new { x.SessionId, x.MapNumber },
                        principalTable: "SessionMaps",
                        principalColumns: new[] { "SessionId", "Number" },
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SessionMapTokens");

            migrationBuilder.DropTable(
                name: "SessionMassages");

            migrationBuilder.DropTable(
                name: "SessionPlayers");

            migrationBuilder.DropTable(
                name: "SessionMaps");

            migrationBuilder.DropTable(
                name: "Sessions");
        }
    }
}
