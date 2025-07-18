﻿using System;

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VttTools.Data.MigrationService.Migrations;
/// <inheritdoc />
public partial class CreateApplicationSchema : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.CreateTable(
            name: "GameSessions",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                Status = table.Column<int>(type: "int", nullable: false),
                SceneId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
            },
            constraints: table => table.PrimaryKey("PK_GameSessions", x => x.Id));

        migrationBuilder.CreateTable(
            name: "Resources",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Type = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Undefined"),
                ContentType = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                Path = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                FileName = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                FileLength = table.Column<decimal>(type: "decimal(20,0)", nullable: false, defaultValue: 0m),
                Duration = table.Column<TimeSpan>(type: "time", nullable: false, defaultValue: new TimeSpan(0, 0, 0, 0, 0)),
                Tags = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "[]"),
                ImageSize_Height = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                ImageSize_Width = table.Column<int>(type: "int", nullable: false, defaultValue: 0)
            },
            constraints: table => table.PrimaryKey("PK_Resources", x => x.Id));

        migrationBuilder.CreateTable(
            name: "Schedule",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Start = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                Duration = table.Column<TimeSpan>(type: "time", nullable: false),
                Recurrence_Count = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                Recurrence_Days = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "[]"),
                Recurrence_Frequency = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Daily"),
                Recurrence_Interval = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                Recurrence_Until = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                Recurrence_UseWeekdays = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Schedule", x => x.Id));

        migrationBuilder.CreateTable(
            name: "Events",
            columns: table => new {
                Timestamp = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                GameSessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Description = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_Events", x => new { x.GameSessionId, x.Timestamp });
                table.ForeignKey(
                    name: "FK_Events_GameSessions_GameSessionId",
                    column: x => x.GameSessionId,
                    principalTable: "GameSessions",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Messages",
            columns: table => new {
                SentAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                GameSessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                SentBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                SentTo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                Type = table.Column<int>(type: "int", nullable: false),
                Content = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_Messages", x => new { x.GameSessionId, x.SentAt });
                table.ForeignKey(
                    name: "FK_Messages_GameSessions_GameSessionId",
                    column: x => x.GameSessionId,
                    principalTable: "GameSessions",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Players",
            columns: table => new {
                UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                GameSessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                IsRequired = table.Column<bool>(type: "bit", nullable: false),
                Type = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_Players", x => new { x.GameSessionId, x.UserId });
                table.ForeignKey(
                    name: "FK_Players_GameSessions_GameSessionId",
                    column: x => x.GameSessionId,
                    principalTable: "GameSessions",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Assets",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Type = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Placeholder"),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                DisplayId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                IsPublished = table.Column<bool>(type: "bit", nullable: false),
                IsPublic = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_Assets", x => x.Id);
                table.ForeignKey(
                    name: "FK_Assets_Resources_DisplayId",
                    column: x => x.DisplayId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Epics",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                DisplayId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                IsPublished = table.Column<bool>(type: "bit", nullable: false),
                IsPublic = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_Epics", x => x.Id);
                table.ForeignKey(
                    name: "FK_Epics_Resources_DisplayId",
                    column: x => x.DisplayId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Participants",
            columns: table => new {
                UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                ScheduleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                IsRequired = table.Column<bool>(type: "bit", nullable: false),
                Type = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_Participants", x => new { x.ScheduleId, x.UserId });
                table.ForeignKey(
                    name: "FK_Participants_Schedule_ScheduleId",
                    column: x => x.ScheduleId,
                    principalTable: "Schedule",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Campaigns",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                EpicId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                DisplayId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                IsPublished = table.Column<bool>(type: "bit", nullable: false),
                IsPublic = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_Campaigns", x => x.Id);
                table.ForeignKey(
                    name: "FK_Campaigns_Epics_EpicId",
                    column: x => x.EpicId,
                    principalTable: "Epics",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_Campaigns_Resources_DisplayId",
                    column: x => x.DisplayId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Adventures",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CampaignId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                BackgroundId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                IsPublished = table.Column<bool>(type: "bit", nullable: false),
                IsPublic = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_Adventures", x => x.Id);
                table.ForeignKey(
                    name: "FK_Adventures_Campaigns_CampaignId",
                    column: x => x.CampaignId,
                    principalTable: "Campaigns",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_Adventures_Resources_BackgroundId",
                    column: x => x.BackgroundId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Scenes",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                AdventureId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                IsPublished = table.Column<bool>(type: "bit", nullable: false),
                ZoomLevel = table.Column<float>(type: "real", nullable: false, defaultValue: 1f),
                StageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Grid_Snap = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                Grid_Type = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "NoGrid"),
                Grid_CellSize_X = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                Grid_CellSize_Y = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                Grid_Offset_X = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                Grid_Offset_Y = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                Panning_X = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                Panning_Y = table.Column<int>(type: "int", nullable: false, defaultValue: 0)
            },
            constraints: table => {
                table.PrimaryKey("PK_Scenes", x => x.Id);
                table.ForeignKey(
                    name: "FK_Scenes_Adventures_AdventureId",
                    column: x => x.AdventureId,
                    principalTable: "Adventures",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_Scenes_Resources_StageId",
                    column: x => x.StageId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "SceneAssets",
            columns: table => new {
                SceneId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Index = table.Column<long>(type: "bigint", nullable: false),
                AssetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Number = table.Column<long>(type: "bigint", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                DisplayId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Rotation = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                Elevation = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                IsLocked = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                ControlledBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                Frame_Background = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: ""),
                Frame_BorderColor = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "white"),
                Frame_BorderThickness = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                Frame_Shape = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Square"),
                Position_X = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                Position_Y = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                Size_Height = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                Size_Width = table.Column<int>(type: "int", nullable: false, defaultValue: 0)
            },
            constraints: table => {
                table.PrimaryKey("PK_SceneAssets", x => new { x.SceneId, x.Index });
                table.ForeignKey(
                    name: "FK_SceneAssets_Assets_AssetId",
                    column: x => x.AssetId,
                    principalTable: "Assets",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_SceneAssets_Resources_DisplayId",
                    column: x => x.DisplayId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_SceneAssets_Scenes_SceneId",
                    column: x => x.SceneId,
                    principalTable: "Scenes",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Adventures_BackgroundId",
            table: "Adventures",
            column: "BackgroundId");

        migrationBuilder.CreateIndex(
            name: "IX_Adventures_CampaignId",
            table: "Adventures",
            column: "CampaignId");

        migrationBuilder.CreateIndex(
            name: "IX_Assets_DisplayId",
            table: "Assets",
            column: "DisplayId");

        migrationBuilder.CreateIndex(
            name: "IX_Campaigns_DisplayId",
            table: "Campaigns",
            column: "DisplayId");

        migrationBuilder.CreateIndex(
            name: "IX_Campaigns_EpicId",
            table: "Campaigns",
            column: "EpicId");

        migrationBuilder.CreateIndex(
            name: "IX_Epics_DisplayId",
            table: "Epics",
            column: "DisplayId");

        migrationBuilder.CreateIndex(
            name: "IX_SceneAssets_AssetId",
            table: "SceneAssets",
            column: "AssetId");

        migrationBuilder.CreateIndex(
            name: "IX_SceneAssets_DisplayId",
            table: "SceneAssets",
            column: "DisplayId");

        migrationBuilder.CreateIndex(
            name: "IX_Scenes_AdventureId",
            table: "Scenes",
            column: "AdventureId");

        migrationBuilder.CreateIndex(
            name: "IX_Scenes_StageId",
            table: "Scenes",
            column: "StageId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropTable(
            name: "Events");

        migrationBuilder.DropTable(
            name: "Messages");

        migrationBuilder.DropTable(
            name: "Participants");

        migrationBuilder.DropTable(
            name: "Players");

        migrationBuilder.DropTable(
            name: "SceneAssets");

        migrationBuilder.DropTable(
            name: "Schedule");

        migrationBuilder.DropTable(
            name: "GameSessions");

        migrationBuilder.DropTable(
            name: "Assets");

        migrationBuilder.DropTable(
            name: "Scenes");

        migrationBuilder.DropTable(
            name: "Adventures");

        migrationBuilder.DropTable(
            name: "Campaigns");

        migrationBuilder.DropTable(
            name: "Epics");

        migrationBuilder.DropTable(
            name: "Resources");
    }
}