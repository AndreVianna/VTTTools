using AuditLog = VttTools.Audit.Model.AuditLog;
using AuditLogEntity = VttTools.Data.Audit.Entities.AuditLog;

namespace VttTools.Data.Audit;

internal static class Mapper {
    internal static Expression<Func<AuditLogEntity, AuditLog>> AsAuditLog = entity
        => new() {
            Id = entity.Id,
            Timestamp = entity.Timestamp,
            UserId = entity.UserId,
            UserEmail = entity.UserEmail,
            Action = entity.Action,
            EntityType = entity.EntityType,
            EntityId = entity.EntityId,
            HttpMethod = entity.HttpMethod,
            Path = entity.Path,
            QueryString = entity.QueryString,
            StatusCode = entity.StatusCode,
            IpAddress = entity.IpAddress,
            UserAgent = entity.UserAgent,
            RequestBody = entity.RequestBody,
            ResponseBody = entity.ResponseBody,
            DurationInMilliseconds = entity.DurationInMilliseconds,
            Result = entity.Result,
            ErrorMessage = entity.ErrorMessage,
        };

    internal static AuditLog? ToModel(this AuditLogEntity? entity)
        => entity == null ? null : new() {
            Id = entity.Id,
            Timestamp = entity.Timestamp,
            UserId = entity.UserId,
            UserEmail = entity.UserEmail,
            Action = entity.Action,
            EntityType = entity.EntityType,
            EntityId = entity.EntityId,
            HttpMethod = entity.HttpMethod,
            Path = entity.Path,
            QueryString = entity.QueryString,
            StatusCode = entity.StatusCode,
            IpAddress = entity.IpAddress,
            UserAgent = entity.UserAgent,
            RequestBody = entity.RequestBody,
            ResponseBody = entity.ResponseBody,
            DurationInMilliseconds = entity.DurationInMilliseconds,
            Result = entity.Result,
            ErrorMessage = entity.ErrorMessage,
        };

    [return: NotNullIfNotNull(nameof(model))]
    internal static AuditLogEntity ToEntity(this AuditLog model)
        => new() {
            Id = model.Id,
            Timestamp = model.Timestamp,
            UserId = model.UserId,
            UserEmail = model.UserEmail,
            Action = model.Action,
            EntityType = model.EntityType,
            EntityId = model.EntityId,
            HttpMethod = model.HttpMethod,
            Path = model.Path,
            QueryString = model.QueryString,
            StatusCode = model.StatusCode,
            IpAddress = model.IpAddress,
            UserAgent = model.UserAgent,
            RequestBody = model.RequestBody,
            ResponseBody = model.ResponseBody,
            DurationInMilliseconds = model.DurationInMilliseconds,
            Result = model.Result,
            ErrorMessage = model.ErrorMessage,
        };

    internal static void UpdateFrom(this AuditLogEntity entity, AuditLog model) {
        entity.Id = model.Id;
        entity.Timestamp = model.Timestamp;
        entity.UserId = model.UserId;
        entity.UserEmail = model.UserEmail;
        entity.Action = model.Action;
        entity.EntityType = model.EntityType;
        entity.EntityId = model.EntityId;
        entity.HttpMethod = model.HttpMethod;
        entity.Path = model.Path;
        entity.QueryString = model.QueryString;
        entity.StatusCode = model.StatusCode;
        entity.IpAddress = model.IpAddress;
        entity.UserAgent = model.UserAgent;
        entity.RequestBody = model.RequestBody;
        entity.ResponseBody = model.ResponseBody;
        entity.DurationInMilliseconds = model.DurationInMilliseconds;
        entity.Result = model.Result;
        entity.ErrorMessage = model.ErrorMessage;
    }
}