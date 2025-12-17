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
            ErrorMessage = entity.ErrorMessage,
            EntityType = entity.EntityType,
            EntityId = entity.EntityId,
            Payload = entity.Payload,
        };

    internal static AuditLog? ToModel(this AuditLogEntity? entity)
        => entity == null ? null : new() {
            Id = entity.Id,
            Timestamp = entity.Timestamp,
            UserId = entity.UserId,
            UserEmail = entity.UserEmail,
            Action = entity.Action,
            ErrorMessage = entity.ErrorMessage,
            EntityType = entity.EntityType,
            EntityId = entity.EntityId,
            Payload = entity.Payload,
        };

    [return: NotNullIfNotNull(nameof(model))]
    internal static AuditLogEntity ToEntity(this AuditLog model)
        => new() {
            Id = model.Id,
            Timestamp = model.Timestamp,
            UserId = model.UserId,
            UserEmail = model.UserEmail,
            Action = model.Action,
            ErrorMessage = model.ErrorMessage,
            EntityType = model.EntityType,
            EntityId = model.EntityId,
            Payload = model.Payload,
        };

    internal static void UpdateFrom(this AuditLogEntity entity, AuditLog model) {
        entity.Id = model.Id;
        entity.Timestamp = model.Timestamp;
        entity.UserId = model.UserId;
        entity.UserEmail = model.UserEmail;
        entity.Action = model.Action;
        entity.ErrorMessage = model.ErrorMessage;
        entity.EntityType = model.EntityType;
        entity.EntityId = model.EntityId;
        entity.Payload = model.Payload;
    }
}
