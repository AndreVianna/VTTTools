#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class CreateApplicationSchema : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AddColumn<Guid>(
            name: "AvatarId",
            table: "Users",
            type: "uniqueidentifier",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "UnitSystem",
            table: "Users",
            type: "int",
            nullable: false,
            defaultValue: 0);

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
                EncounterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
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
                Description = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: true),
                Type = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Undefined"),
                ContentType = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                Path = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                FileName = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                FileLength = table.Column<decimal>(type: "decimal(20,0)", nullable: false, defaultValue: 0m),
                Width = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                Height = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                Duration = table.Column<TimeSpan>(type: "time", nullable: false, defaultValue: new TimeSpan(0, 0, 0, 0, 0)),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                IsPublished = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                IsPublic = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
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
                Kind = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Subtype = table.Column<string>(type: "nvarchar(max)", nullable: true),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                PortraitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                Width = table.Column<double>(type: "float", nullable: false, defaultValue: 1.0),
                Height = table.Column<double>(type: "float", nullable: false, defaultValue: 1.0),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                IsPublished = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                IsPublic = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_Assets", x => x.Id);
                table.ForeignKey(
                    name: "FK_Assets_Resources_PortraitId",
                    column: x => x.PortraitId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "ResourceFeatures",
            columns: table => new {
                ResourceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Key = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                Index = table.Column<int>(type: "int", nullable: false),
                Value = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_ResourceFeatures", x => new { x.ResourceId, x.Key, x.Index });
                table.ForeignKey(
                    name: "FK_ResourceFeatures_Resources_ResourceId",
                    column: x => x.ResourceId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Worlds",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                BackgroundId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                IsPublished = table.Column<bool>(type: "bit", nullable: false),
                IsPublic = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_Worlds", x => x.Id);
                table.ForeignKey(
                    name: "FK_Worlds_Resources_BackgroundId",
                    column: x => x.BackgroundId,
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
            name: "AssetStatBlockValues",
            columns: table => new {
                AssetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Level = table.Column<int>(type: "int", nullable: false),
                Key = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                Value = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: true),
                Type = table.Column<string>(type: "nvarchar(max)", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_AssetStatBlockValues", x => new { x.AssetId, x.Level, x.Key });
                table.ForeignKey(
                    name: "FK_AssetStatBlockValues_Assets_AssetId",
                    column: x => x.AssetId,
                    principalTable: "Assets",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "AssetTokens",
            columns: table => new {
                AssetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                TokenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Index = table.Column<int>(type: "int", nullable: false)
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
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Campaigns",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                WorldId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                BackgroundId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                IsPublished = table.Column<bool>(type: "bit", nullable: false),
                IsPublic = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_Campaigns", x => x.Id);
                table.ForeignKey(
                    name: "FK_Campaigns_Resources_BackgroundId",
                    column: x => x.BackgroundId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Campaigns_Worlds_WorldId",
                    column: x => x.WorldId,
                    principalTable: "Worlds",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Adventures",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                WorldId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Adventures_Resources_BackgroundId",
                    column: x => x.BackgroundId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Adventures_Worlds_WorldId",
                    column: x => x.WorldId,
                    principalTable: "Worlds",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Encounters",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                AdventureId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                IsPublished = table.Column<bool>(type: "bit", nullable: false),
                BackgroundId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                ZoomLevel = table.Column<float>(type: "real", nullable: false, defaultValue: 1f),
                GroundElevation = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                Weather = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Clear"),
                AmbientLight = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Default"),
                AmbientSoundId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                GridScale = table.Column<double>(type: "float", nullable: false, defaultValue: 5.0),
                GridType = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "NoGrid"),
                GridCellHeight = table.Column<double>(type: "float", nullable: false, defaultValue: 64.0),
                GridCellWidth = table.Column<double>(type: "float", nullable: false, defaultValue: 64.0),
                GridOffsetLeft = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                GridOffsetTop = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                PanningX = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                PanningY = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0)
            },
            constraints: table => {
                table.PrimaryKey("PK_Encounters", x => x.Id);
                table.ForeignKey(
                    name: "FK_Encounters_Adventures_AdventureId",
                    column: x => x.AdventureId,
                    principalTable: "Adventures",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_Encounters_Resources_AmbientSoundId",
                    column: x => x.AmbientSoundId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Encounters_Resources_BackgroundId",
                    column: x => x.BackgroundId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "EncounterAssets",
            columns: table => new {
                EncounterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Index = table.Column<long>(type: "bigint", nullable: false),
                AssetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                IsLocked = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                IsVisible = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                ImageId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                Rotation = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                Elevation = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                ControlledBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                Notes = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: true),
                FrameBackground = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: ""),
                FrameBorderColor = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "white"),
                FrameBorderThickness = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                FrameShape = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Square"),
                X = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                Y = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                Height = table.Column<double>(type: "float", nullable: false, defaultValue: 1.0),
                Width = table.Column<double>(type: "float", nullable: false, defaultValue: 1.0)
            },
            constraints: table => {
                table.PrimaryKey("PK_EncounterAssets", x => new { x.EncounterId, x.Index });
                table.ForeignKey(
                    name: "FK_EncounterAssets_Assets_AssetId",
                    column: x => x.AssetId,
                    principalTable: "Assets",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_EncounterAssets_Encounters_EncounterId",
                    column: x => x.EncounterId,
                    principalTable: "Encounters",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_EncounterAssets_Resources_ImageId",
                    column: x => x.ImageId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "EncounterLightSources",
            columns: table => new {
                EncounterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Index = table.Column<long>(type: "bigint", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                Type = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Natural"),
                Range = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                Direction = table.Column<float>(type: "real", nullable: true),
                Arc = table.Column<float>(type: "real", nullable: true),
                IsOn = table.Column<bool>(type: "bit", nullable: false),
                Color = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: true),
                X = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                Y = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0)
            },
            constraints: table => {
                table.PrimaryKey("PK_EncounterLightSources", x => new { x.EncounterId, x.Index });
                table.ForeignKey(
                    name: "FK_EncounterLightSources_Encounters_EncounterId",
                    column: x => x.EncounterId,
                    principalTable: "Encounters",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "EncounterRegions",
            columns: table => new {
                EncounterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Index = table.Column<long>(type: "bigint", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                Type = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Elevation"),
                Value = table.Column<int>(type: "int", nullable: false),
                Vertices = table.Column<string>(type: "nvarchar(max)", nullable: true)
            },
            constraints: table => {
                table.PrimaryKey("PK_EncounterRegions", x => new { x.EncounterId, x.Index });
                table.ForeignKey(
                    name: "FK_EncounterRegions_Encounters_EncounterId",
                    column: x => x.EncounterId,
                    principalTable: "Encounters",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "EncounterSoundSources",
            columns: table => new {
                EncounterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Index = table.Column<long>(type: "bigint", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                Range = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                IsPlaying = table.Column<bool>(type: "bit", nullable: false),
                ResourceId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                X = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                Y = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0)
            },
            constraints: table => {
                table.PrimaryKey("PK_EncounterSoundSources", x => new { x.EncounterId, x.Index });
                table.ForeignKey(
                    name: "FK_EncounterSoundSources_Encounters_EncounterId",
                    column: x => x.EncounterId,
                    principalTable: "Encounters",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_EncounterSoundSources_Resources_ResourceId",
                    column: x => x.ResourceId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "EncounterWalls",
            columns: table => new {
                EncounterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Index = table.Column<long>(type: "bigint", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_EncounterWalls", x => new { x.EncounterId, x.Index });
                table.ForeignKey(
                    name: "FK_EncounterWalls_Encounters_EncounterId",
                    column: x => x.EncounterId,
                    principalTable: "Encounters",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "EncounterWallSegments",
            columns: table => new {
                EncounterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                WallIndex = table.Column<long>(type: "bigint", nullable: false),
                Index = table.Column<long>(type: "bigint", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                Type = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Wall"),
                IsOpaque = table.Column<bool>(type: "bit", nullable: false),
                State = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Open"),
                EndH = table.Column<double>(type: "float", nullable: false),
                EndX = table.Column<double>(type: "float", nullable: false),
                EndY = table.Column<double>(type: "float", nullable: false),
                StartH = table.Column<double>(type: "float", nullable: false),
                StartX = table.Column<double>(type: "float", nullable: false),
                StartY = table.Column<double>(type: "float", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_EncounterWallSegments", x => new { x.EncounterId, x.WallIndex, x.Index });
                table.ForeignKey(
                    name: "FK_EncounterWallSegments_EncounterWalls_EncounterId_WallIndex",
                    columns: x => new { x.EncounterId, x.WallIndex },
                    principalTable: "EncounterWalls",
                    principalColumns: ["EncounterId", "Index"],
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.UpdateData(
            table: "Users",
            keyColumn: "Id",
            keyValue: new Guid("019639ea-c7de-7a01-8548-41edfccde206"),
            columns: ["AvatarId", "UnitSystem"],
            values: [null, 0]);

        migrationBuilder.CreateIndex(
            name: "IX_Adventures_BackgroundId",
            table: "Adventures",
            column: "BackgroundId");

        migrationBuilder.CreateIndex(
            name: "IX_Adventures_CampaignId",
            table: "Adventures",
            column: "CampaignId");

        migrationBuilder.CreateIndex(
            name: "IX_Adventures_WorldId",
            table: "Adventures",
            column: "WorldId");

        migrationBuilder.CreateIndex(
            name: "IX_Assets_PortraitId",
            table: "Assets",
            column: "PortraitId");

        migrationBuilder.CreateIndex(
            name: "IX_AssetTokens_AssetId_Index",
            table: "AssetTokens",
            columns: ["AssetId", "Index"],
            unique: true);

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
            name: "IX_Campaigns_BackgroundId",
            table: "Campaigns",
            column: "BackgroundId");

        migrationBuilder.CreateIndex(
            name: "IX_Campaigns_WorldId",
            table: "Campaigns",
            column: "WorldId");

        migrationBuilder.CreateIndex(
            name: "IX_EncounterAssets_AssetId",
            table: "EncounterAssets",
            column: "AssetId");

        migrationBuilder.CreateIndex(
            name: "IX_EncounterAssets_ImageId",
            table: "EncounterAssets",
            column: "ImageId");

        migrationBuilder.CreateIndex(
            name: "IX_EncounterLightSources_EncounterId",
            table: "EncounterLightSources",
            column: "EncounterId");

        migrationBuilder.CreateIndex(
            name: "IX_EncounterRegions_EncounterId",
            table: "EncounterRegions",
            column: "EncounterId");

        migrationBuilder.CreateIndex(
            name: "IX_Encounters_AdventureId",
            table: "Encounters",
            column: "AdventureId");

        migrationBuilder.CreateIndex(
            name: "IX_Encounters_AmbientSoundId",
            table: "Encounters",
            column: "AmbientSoundId");

        migrationBuilder.CreateIndex(
            name: "IX_Encounters_BackgroundId",
            table: "Encounters",
            column: "BackgroundId");

        migrationBuilder.CreateIndex(
            name: "IX_EncounterSoundSources_EncounterId",
            table: "EncounterSoundSources",
            column: "EncounterId");

        migrationBuilder.CreateIndex(
            name: "IX_EncounterSoundSources_ResourceId",
            table: "EncounterSoundSources",
            column: "ResourceId");

        migrationBuilder.CreateIndex(
            name: "IX_EncounterWalls_EncounterId",
            table: "EncounterWalls",
            column: "EncounterId");

        migrationBuilder.CreateIndex(
            name: "IX_EncounterWallSegments_EncounterId",
            table: "EncounterWallSegments",
            column: "EncounterId");

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
            name: "IX_Worlds_BackgroundId",
            table: "Worlds",
            column: "BackgroundId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropTable(
            name: "AssetStatBlockValues");

        migrationBuilder.DropTable(
            name: "AssetTokens");

        migrationBuilder.DropTable(
            name: "AuditLogs");

        migrationBuilder.DropTable(
            name: "EncounterAssets");

        migrationBuilder.DropTable(
            name: "EncounterLightSources");

        migrationBuilder.DropTable(
            name: "EncounterRegions");

        migrationBuilder.DropTable(
            name: "EncounterSoundSources");

        migrationBuilder.DropTable(
            name: "EncounterWallSegments");

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
            name: "ResourceFeatures");

        migrationBuilder.DropTable(
            name: "StatBlocks");

        migrationBuilder.DropTable(
            name: "Assets");

        migrationBuilder.DropTable(
            name: "EncounterWalls");

        migrationBuilder.DropTable(
            name: "Schedule");

        migrationBuilder.DropTable(
            name: "GameSessions");

        migrationBuilder.DropTable(
            name: "Encounters");

        migrationBuilder.DropTable(
            name: "Adventures");

        migrationBuilder.DropTable(
            name: "Campaigns");

        migrationBuilder.DropTable(
            name: "Worlds");

        migrationBuilder.DropTable(
            name: "Resources");

        migrationBuilder.DropColumn(
            name: "AvatarId",
            table: "Users");

        migrationBuilder.DropColumn(
            name: "UnitSystem",
            table: "Users");
    }
}
