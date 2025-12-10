namespace VttTools.Data.Audit;

public class AuditMapperTests {
    [Fact]
    public void ToModel_WithValidEntity_ReturnsCorrectModel() {
        var entity = new Entities.AuditLog {
            Id = Guid.CreateVersion7(),
            Timestamp = DateTime.UtcNow,
            UserId = Guid.CreateVersion7(),
            UserEmail = "test@test.com",
            Action = "Create",
            EntityType = "Asset",
            EntityId = Guid.CreateVersion7().ToString(),
            HttpMethod = "POST",
            Path = "/api/assets",
            QueryString = "?filter=published",
            StatusCode = 201,
            IpAddress = "192.168.1.1",
            UserAgent = "Mozilla/5.0",
            RequestBody = "{\"name\":\"test\"}",
            ResponseBody = "{\"id\":\"123\"}",
            DurationInMilliseconds = 150,
            Result = "Success",
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
        result.HttpMethod.Should().Be(entity.HttpMethod);
        result.Path.Should().Be(entity.Path);
        result.QueryString.Should().Be(entity.QueryString);
        result.StatusCode.Should().Be(entity.StatusCode);
        result.IpAddress.Should().Be(entity.IpAddress);
        result.UserAgent.Should().Be(entity.UserAgent);
        result.RequestBody.Should().Be(entity.RequestBody);
        result.ResponseBody.Should().Be(entity.ResponseBody);
        result.DurationInMilliseconds.Should().Be(entity.DurationInMilliseconds);
        result.Result.Should().Be(entity.Result);
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
            Action = "Update",
            EntityType = "Campaign",
            HttpMethod = "PUT",
            Path = "/api/campaigns",
            StatusCode = 500,
            IpAddress = "192.168.1.1",
            UserAgent = "Mozilla/5.0",
            DurationInMilliseconds = 200,
            Result = "Failed",
            ErrorMessage = "Database connection failed",
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.ErrorMessage.Should().Be("Database connection failed");
        result.Result.Should().Be("Failed");
    }

    [Fact]
    public void ToEntity_WithValidModel_ReturnsCorrectEntity() {
        var model = new AuditLog {
            Id = Guid.CreateVersion7(),
            Timestamp = DateTime.UtcNow,
            UserId = Guid.CreateVersion7(),
            UserEmail = "user@example.com",
            Action = "Delete",
            EntityType = "World",
            EntityId = Guid.CreateVersion7().ToString(),
            HttpMethod = "DELETE",
            Path = "/api/worlds",
            QueryString = null,
            StatusCode = 200,
            IpAddress = "10.0.0.1",
            UserAgent = "Chrome/100",
            RequestBody = null,
            ResponseBody = null,
            DurationInMilliseconds = 75,
            Result = "Success",
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
        result.HttpMethod.Should().Be(model.HttpMethod);
        result.Path.Should().Be(model.Path);
        result.QueryString.Should().BeNull();
        result.StatusCode.Should().Be(model.StatusCode);
        result.IpAddress.Should().Be(model.IpAddress);
        result.UserAgent.Should().Be(model.UserAgent);
        result.RequestBody.Should().BeNull();
        result.ResponseBody.Should().BeNull();
        result.DurationInMilliseconds.Should().Be(model.DurationInMilliseconds);
        result.Result.Should().Be(model.Result);
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
            HttpMethod = "GET",
            Path = "/old/path",
            QueryString = "old-query",
            StatusCode = 200,
            IpAddress = "192.168.1.1",
            UserAgent = "OldAgent",
            RequestBody = "old-request",
            ResponseBody = "old-response",
            DurationInMilliseconds = 100,
            Result = "OldResult",
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
            HttpMethod = "POST",
            Path = "/new/path",
            QueryString = "new-query",
            StatusCode = 201,
            IpAddress = "10.0.0.1",
            UserAgent = "NewAgent",
            RequestBody = "new-request",
            ResponseBody = "new-response",
            DurationInMilliseconds = 250,
            Result = "NewResult",
            ErrorMessage = "new-error",
        };

        entity.UpdateFrom(model);

        entity.Timestamp.Should().Be(model.Timestamp);
        entity.UserId.Should().Be(model.UserId);
        entity.UserEmail.Should().Be(model.UserEmail);
        entity.Action.Should().Be(model.Action);
        entity.EntityType.Should().Be(model.EntityType);
        entity.EntityId.Should().Be(model.EntityId);
        entity.HttpMethod.Should().Be(model.HttpMethod);
        entity.Path.Should().Be(model.Path);
        entity.QueryString.Should().Be(model.QueryString);
        entity.StatusCode.Should().Be(model.StatusCode);
        entity.IpAddress.Should().Be(model.IpAddress);
        entity.UserAgent.Should().Be(model.UserAgent);
        entity.RequestBody.Should().Be(model.RequestBody);
        entity.ResponseBody.Should().Be(model.ResponseBody);
        entity.DurationInMilliseconds.Should().Be(model.DurationInMilliseconds);
        entity.Result.Should().Be(model.Result);
        entity.ErrorMessage.Should().Be(model.ErrorMessage);
    }
}
