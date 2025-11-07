#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class CreateAppData : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AddColumn<Guid>(
            name: "AvatarId",
            table: "Users",
            type: "uniqueidentifier",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "AuditLogs",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                UserEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                EntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                EntityId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                HttpMethod = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                Path = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                QueryString = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                StatusCode = table.Column<int>(type: "int", nullable: false),
                IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                RequestBody = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                ResponseBody = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                DurationInMilliseconds = table.Column<int>(type: "int", nullable: false),
                Result = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                ErrorMessage = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true)
            },
            constraints: table => table.PrimaryKey("PK_AuditLogs", x => x.Id));

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
            name: "StatBlocks",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_StatBlocks", x => x.Id));

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
                Kind = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                PortraitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                IsPublished = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                IsPublic = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                Size_Height = table.Column<double>(type: "float", nullable: false, defaultValue: 1.0),
                Size_Width = table.Column<double>(type: "float", nullable: false, defaultValue: 1.0),
                StatBlockId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                Category = table.Column<string>(type: "nvarchar(max)", nullable: true),
                TokenStyle_BorderColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                TokenStyle_BackgroundColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                TokenStyle_Shape = table.Column<string>(type: "nvarchar(max)", nullable: true),
                IsMovable = table.Column<bool>(type: "bit", nullable: true),
                IsOpaque = table.Column<bool>(type: "bit", nullable: true),
                TriggerEffectId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
            },
            constraints: table => {
                table.PrimaryKey("PK_Assets", x => x.Id);
                table.ForeignKey(
                    name: "FK_Assets_Resources_PortraitId",
                    column: x => x.PortraitId,
                    principalTable: "Resources",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "Effects",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: true),
                Shape = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Size = table.Column<double>(type: "float", nullable: false),
                Direction = table.Column<double>(type: "float", nullable: true),
                BoundedByStructures = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                ResourceId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_Effects", x => x.Id);
                table.ForeignKey(
                    name: "FK_Effects_Resources_ResourceId",
                    column: x => x.ResourceId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "Epics",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                ResourceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                IsPublished = table.Column<bool>(type: "bit", nullable: false),
                IsPublic = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_Epics", x => x.Id);
                table.ForeignKey(
                    name: "FK_Epics_Resources_ResourceId",
                    column: x => x.ResourceId,
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
            name: "AssetTokens",
            columns: table => new {
                AssetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                TokenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                IsDefault = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_AssetTokens", x => new { x.AssetId, x.TokenId });
                table.ForeignKey(
                    name: "FK_AssetTokens_Assets_AssetId",
                    column: x => x.AssetId,
                    principalTable: "Assets",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_AssetTokens_Resources_TokenId",
                    column: x => x.TokenId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Campaigns",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                EpicId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                ResourceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
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
                    name: "FK_Campaigns_Resources_ResourceId",
                    column: x => x.ResourceId,
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
                Style = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                BackgroundId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                IsOneShot = table.Column<bool>(type: "bit", nullable: false),
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
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "Scenes",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                AdventureId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                IsPublished = table.Column<bool>(type: "bit", nullable: false),
                ZoomLevel = table.Column<float>(type: "real", nullable: false, defaultValue: 1f),
                BackgroundId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                Grid_Snap = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                Grid_Type = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "NoGrid"),
                Grid_CellSize_Height = table.Column<double>(type: "float", nullable: false, defaultValue: 64.0),
                Grid_CellSize_Width = table.Column<double>(type: "float", nullable: false, defaultValue: 64.0),
                Grid_Offset_Left = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                Grid_Offset_Top = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                Panning_X = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                Panning_Y = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0)
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
                    name: "FK_Scenes_Resources_BackgroundId",
                    column: x => x.BackgroundId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "SceneAssets",
            columns: table => new {
                SceneId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Index = table.Column<long>(type: "bigint", nullable: false),
                AssetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Number = table.Column<long>(type: "bigint", nullable: false),
                IsLocked = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                IsVisible = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                PortraitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                TokenId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                Rotation = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                Elevation = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                ControlledBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                Notes = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: true),
                Frame_Background = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: ""),
                Frame_BorderColor = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "white"),
                Frame_BorderThickness = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                Frame_Shape = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Square"),
                Position_X = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                Position_Y = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                Size_Height = table.Column<double>(type: "float", nullable: false, defaultValue: 1.0),
                Size_Width = table.Column<double>(type: "float", nullable: false, defaultValue: 1.0)
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
                    name: "FK_SceneAssets_Resources_PortraitId",
                    column: x => x.PortraitId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_SceneAssets_Resources_TokenId",
                    column: x => x.TokenId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_SceneAssets_Scenes_SceneId",
                    column: x => x.SceneId,
                    principalTable: "Scenes",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "SceneEffects",
            columns: table => new {
                SceneId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Index = table.Column<long>(type: "bigint", nullable: false),
                EffectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Size = table.Column<float>(type: "real", nullable: true),
                Direction = table.Column<float>(type: "real", nullable: true),
                SceneId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                Origin_X = table.Column<double>(type: "float", nullable: false),
                Origin_Y = table.Column<double>(type: "float", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_SceneEffects", x => new { x.SceneId, x.Index });
                table.ForeignKey(
                    name: "FK_SceneEffects_Effects_EffectId",
                    column: x => x.EffectId,
                    principalTable: "Effects",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_SceneEffects_Scenes_SceneId",
                    column: x => x.SceneId,
                    principalTable: "Scenes",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_SceneEffects_Scenes_SceneId1",
                    column: x => x.SceneId1,
                    principalTable: "Scenes",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "SceneRegions",
            columns: table => new {
                SceneId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Index = table.Column<long>(type: "bigint", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Type = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                Value = table.Column<int>(type: "int", nullable: true),
                Label = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                Color = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                Vertices = table.Column<string>(type: "nvarchar(max)", nullable: true)
            },
            constraints: table => {
                table.PrimaryKey("PK_SceneRegions", x => new { x.SceneId, x.Index });
                table.ForeignKey(
                    name: "FK_SceneRegions_Scenes_SceneId",
                    column: x => x.SceneId,
                    principalTable: "Scenes",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "SceneSources",
            columns: table => new {
                SceneId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Index = table.Column<long>(type: "bigint", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Type = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                Direction = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                Range = table.Column<float>(type: "real", nullable: true),
                Intensity = table.Column<float>(type: "real", nullable: true),
                HasGradient = table.Column<bool>(type: "bit", nullable: false),
                Position_X = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                Position_Y = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0)
            },
            constraints: table => {
                table.PrimaryKey("PK_SceneSources", x => new { x.SceneId, x.Index });
                table.ForeignKey(
                    name: "FK_SceneSources_Scenes_SceneId",
                    column: x => x.SceneId,
                    principalTable: "Scenes",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "SceneWalls",
            columns: table => new {
                SceneId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Index = table.Column<long>(type: "bigint", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Visibility = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                IsClosed = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                Material = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                Color = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: true),
                Poles = table.Column<string>(type: "nvarchar(max)", nullable: true)
            },
            constraints: table => {
                table.PrimaryKey("PK_SceneWalls", x => new { x.SceneId, x.Index });
                table.ForeignKey(
                    name: "FK_SceneWalls_Scenes_SceneId",
                    column: x => x.SceneId,
                    principalTable: "Scenes",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.UpdateData(
            table: "Users",
            keyColumn: "Id",
            keyValue: new Guid("019639ea-c7de-7a01-8548-41edfccde206"),
            column: "AvatarId",
            value: null);

        migrationBuilder.CreateIndex(
            name: "IX_Users_AvatarId",
            table: "Users",
            column: "AvatarId",
            unique: true,
            filter: "[AvatarId] IS NOT NULL");

        migrationBuilder.CreateIndex(
            name: "IX_Adventures_BackgroundId",
            table: "Adventures",
            column: "BackgroundId");

        migrationBuilder.CreateIndex(
            name: "IX_Adventures_CampaignId",
            table: "Adventures",
            column: "CampaignId");

        migrationBuilder.CreateIndex(
            name: "IX_Assets_PortraitId",
            table: "Assets",
            column: "PortraitId");

        migrationBuilder.CreateIndex(
            name: "IX_AssetTokens_TokenId",
            table: "AssetTokens",
            column: "TokenId");

        migrationBuilder.CreateIndex(
            name: "IX_AuditLogs_Action",
            table: "AuditLogs",
            column: "Action");

        migrationBuilder.CreateIndex(
            name: "IX_AuditLogs_EntityType",
            table: "AuditLogs",
            column: "EntityType");

        migrationBuilder.CreateIndex(
            name: "IX_AuditLogs_Result",
            table: "AuditLogs",
            column: "Result");

        migrationBuilder.CreateIndex(
            name: "IX_AuditLogs_Timestamp",
            table: "AuditLogs",
            column: "Timestamp",
            descending: []);

        migrationBuilder.CreateIndex(
            name: "IX_AuditLogs_Timestamp_UserId",
            table: "AuditLogs",
            columns: ["Timestamp", "UserId"],
            descending: [true, false]);

        migrationBuilder.CreateIndex(
            name: "IX_AuditLogs_UserId",
            table: "AuditLogs",
            column: "UserId");

        migrationBuilder.CreateIndex(
            name: "IX_Campaigns_EpicId",
            table: "Campaigns",
            column: "EpicId");

        migrationBuilder.CreateIndex(
            name: "IX_Campaigns_ResourceId",
            table: "Campaigns",
            column: "ResourceId");

        migrationBuilder.CreateIndex(
            name: "IX_Effects_ResourceId",
            table: "Effects",
            column: "ResourceId");

        migrationBuilder.CreateIndex(
            name: "IX_Epics_ResourceId",
            table: "Epics",
            column: "ResourceId");

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

        migrationBuilder.CreateIndex(
            name: "IX_SceneAssets_AssetId",
            table: "SceneAssets",
            column: "AssetId");

        migrationBuilder.CreateIndex(
            name: "IX_SceneAssets_PortraitId",
            table: "SceneAssets",
            column: "PortraitId");

        migrationBuilder.CreateIndex(
            name: "IX_SceneAssets_TokenId",
            table: "SceneAssets",
            column: "TokenId");

        migrationBuilder.CreateIndex(
            name: "IX_SceneEffects_EffectId",
            table: "SceneEffects",
            column: "EffectId");

        migrationBuilder.CreateIndex(
            name: "IX_SceneEffects_SceneId1",
            table: "SceneEffects",
            column: "SceneId1");

        migrationBuilder.CreateIndex(
            name: "IX_SceneRegions_SceneId",
            table: "SceneRegions",
            column: "SceneId");

        migrationBuilder.CreateIndex(
            name: "IX_Scenes_AdventureId",
            table: "Scenes",
            column: "AdventureId");

        migrationBuilder.CreateIndex(
            name: "IX_Scenes_BackgroundId",
            table: "Scenes",
            column: "BackgroundId");

        migrationBuilder.CreateIndex(
            name: "IX_SceneSources_SceneId",
            table: "SceneSources",
            column: "SceneId");

        migrationBuilder.CreateIndex(
            name: "IX_SceneWalls_SceneId",
            table: "SceneWalls",
            column: "SceneId");

        migrationBuilder.AddForeignKey(
            name: "FK_Users_Resources_AvatarId",
            table: "Users",
            column: "AvatarId",
            principalTable: "Resources",
            principalColumn: "Id",
            onDelete: ReferentialAction.SetNull);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropForeignKey(
            name: "FK_Users_Resources_AvatarId",
            table: "Users");

        migrationBuilder.DropTable(
            name: "AssetTokens");

        migrationBuilder.DropTable(
            name: "AuditLogs");

        migrationBuilder.DropTable(
            name: "Events");

        migrationBuilder.DropTable(
            name: "MaintenanceMode");

        migrationBuilder.DropTable(
            name: "Messages");

        migrationBuilder.DropTable(
            name: "Participants");

        migrationBuilder.DropTable(
            name: "Players");

        migrationBuilder.DropTable(
            name: "SceneAssets");

        migrationBuilder.DropTable(
            name: "SceneEffects");

        migrationBuilder.DropTable(
            name: "SceneRegions");

        migrationBuilder.DropTable(
            name: "SceneSources");

        migrationBuilder.DropTable(
            name: "SceneWalls");

        migrationBuilder.DropTable(
            name: "StatBlocks");

        migrationBuilder.DropTable(
            name: "Schedule");

        migrationBuilder.DropTable(
            name: "GameSessions");

        migrationBuilder.DropTable(
            name: "Assets");

        migrationBuilder.DropTable(
            name: "Effects");

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

        migrationBuilder.DropIndex(
            name: "IX_Users_AvatarId",
            table: "Users");

        migrationBuilder.DropColumn(
            name: "AvatarId",
            table: "Users");
    }
}
