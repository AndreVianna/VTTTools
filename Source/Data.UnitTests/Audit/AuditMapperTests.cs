using VttTools.Audit.Model.Payloads;

namespace VttTools.Data.Audit;

public class AuditMapperTests {
    private static string CreateHttpPayload() {
        var payload = new HttpAuditPayload {
            HttpMethod = "POST",
            Path = "/api/assets",
            QueryString = "?filter=published",
            StatusCode = 201,
            IpAddress = "192.168.1.1",
            UserAgent = "Mozilla/5.0",
            RequestBody = "{\"name\":\"test\"}",
            ResponseBody = "{\"id\":\"123\"}",
            DurationMs = 150,
            Result = "Success",
        };
        return JsonSerializer.Serialize(payload, JsonDefaults.Options);
    }

    [Fact]
    public void ToModel_WithValidEntity_ReturnsCorrectModel() {
        var entity = new Entities.AuditLog {
            Id = Guid.CreateVersion7(),
            Timestamp = DateTime.UtcNow,
            UserId = Guid.CreateVersion7(),
            UserEmail = "test@test.com",
            Action = "Asset:Created:ByUser",
            EntityType = "Asset",
            EntityId = Guid.CreateVersion7().ToString(),
            Payload = CreateHttpPayload(),
            ErrorMessage = null,
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.Id.Should().Be(entity.Id);
        result.Timestamp.Should().Be(entity.Timestamp);
        result.UserId.Should().Be(entity.UserId);
        result.UserEmail.Should().Be(entity.UserEmail);
        result.Action.Should().Be(entity.Action);
        result.EntityType.Should().Be(entity.EntityType);
        result.EntityId.Should().Be(entity.EntityId);
        result.Payload.Should().Be(entity.Payload);
        result.ErrorMessage.Should().BeNull();
    }

    [Fact]
    public void ToModel_WithNullEntity_ReturnsNull() {
        Entities.AuditLog? entity = null;

        var result = entity.ToModel();

        result.Should().BeNull();
    }

    [Fact]
    public void ToModel_WithErrorMessage_IncludesErrorMessage() {
        var entity = new Entities.AuditLog {
            Id = Guid.CreateVersion7(),
            Timestamp = DateTime.UtcNow,
            UserId = Guid.CreateVersion7(),
            UserEmail = "test@test.com",
            Action = "Campaign:Updated:ByUser",
            EntityType = "Campaign",
            Payload = CreateHttpPayload(),
            ErrorMessage = "Database connection failed",
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.ErrorMessage.Should().Be("Database connection failed");
    }

    [Fact]
    public void ToEntity_WithValidModel_ReturnsCorrectEntity() {
        var model = new AuditLog {
            Id = Guid.CreateVersion7(),
            Timestamp = DateTime.UtcNow,
            UserId = Guid.CreateVersion7(),
            UserEmail = "user@example.com",
            Action = "World:Deleted:ByUser",
            EntityType = "World",
            EntityId = Guid.CreateVersion7().ToString(),
            Payload = CreateHttpPayload(),
            ErrorMessage = null,
        };

        var result = model.ToEntity();

        result.Should().NotBeNull();
        result.Id.Should().Be(model.Id);
        result.Timestamp.Should().Be(model.Timestamp);
        result.UserId.Should().Be(model.UserId);
        result.UserEmail.Should().Be(model.UserEmail);
        result.Action.Should().Be(model.Action);
        result.EntityType.Should().Be(model.EntityType);
        result.EntityId.Should().Be(model.EntityId);
        result.Payload.Should().Be(model.Payload);
        result.ErrorMessage.Should().BeNull();
    }

    [Fact]
    public void UpdateFrom_UpdatesAllProperties() {
        var entity = new Entities.AuditLog {
            Id = Guid.CreateVersion7(),
            Timestamp = DateTime.UtcNow.AddDays(-1),
            UserId = Guid.CreateVersion7(),
            UserEmail = "old@test.com",
            Action = "OldAction",
            EntityType = "OldType",
            EntityId = "old-id",
            Payload = "{\"old\":\"payload\"}",
            ErrorMessage = "old-error",
        };

        var model = new AuditLog {
            Id = entity.Id,
            Timestamp = DateTime.UtcNow,
            UserId = Guid.CreateVersion7(),
            UserEmail = "new@test.com",
            Action = "NewAction",
            EntityType = "NewType",
            EntityId = "new-id",
            Payload = "{\"new\":\"payload\"}",
            ErrorMessage = "new-error",
        };

        entity.UpdateFrom(model);

        entity.Timestamp.Should().Be(model.Timestamp);
        entity.UserId.Should().Be(model.UserId);
        entity.UserEmail.Should().Be(model.UserEmail);
        entity.Action.Should().Be(model.Action);
        entity.EntityType.Should().Be(model.EntityType);
        entity.EntityId.Should().Be(model.EntityId);
        entity.Payload.Should().Be(model.Payload);
        entity.ErrorMessage.Should().Be(model.ErrorMessage);
    }

    [Fact]
    public void ToModel_WithJobPayload_ParsesCorrectly() {
        var jobPayload = new JobCreatedPayload {
            Type = "BulkAssetGeneration",
            TotalItems = 5,
            EstimatedDuration = "00:00:07.5",
        };
        var entity = new Entities.AuditLog {
            Id = Guid.CreateVersion7(),
            Timestamp = DateTime.UtcNow,
            UserId = Guid.CreateVersion7(),
            UserEmail = "test@test.com",
            Action = "Job:Created",
            EntityType = "Job",
            EntityId = Guid.CreateVersion7().ToString(),
            Payload = JsonSerializer.Serialize(jobPayload, JsonDefaults.Options),
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.Payload.Should().NotBeNullOrEmpty();
        result.Payload.Should().Contain("BulkAssetGeneration");
        result.Payload.Should().Contain("5");
    }

    [Fact]
    public void ToModel_WithNullPayload_ReturnsNullPayload() {
        var entity = new Entities.AuditLog {
            Id = Guid.CreateVersion7(),
            Timestamp = DateTime.UtcNow,
            UserId = Guid.CreateVersion7(),
            UserEmail = "test@test.com",
            Action = "Job:Canceled",
            EntityType = "Job",
            EntityId = Guid.CreateVersion7().ToString(),
            Payload = null,
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.Payload.Should().BeNull();
    }
}