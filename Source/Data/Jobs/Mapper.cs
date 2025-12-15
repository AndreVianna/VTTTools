using Job = VttTools.Jobs.Model.Job;
using JobEntity = VttTools.Data.Jobs.Entities.Job;
using JobItem = VttTools.Jobs.Model.JobItem;
using JobItemEntity = VttTools.Data.Jobs.Entities.JobItem;

namespace VttTools.Data.Jobs;

internal static class Mapper {
    public static Expression<Func<JobEntity, Job>> AsJob = entity
        => new() {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Type = entity.Type,
            Status = entity.Status,
            EstimatedDuration = entity.EstimatedDuration,
            StartedAt = entity.StartedAt,
            CompletedAt = entity.CompletedAt,
            Items = entity.Items.AsQueryable().OrderBy(i => i.Index).Select(AsJobItem!).ToList(),
        };

    public static Expression<Func<JobItemEntity, JobItem>> AsJobItem = entity
        => new() {
            Index = entity.Index,
            Status = entity.Status,
            Data = entity.Data,
            Message = entity.Message,
            StartedAt = entity.StartedAt,
            CompletedAt = entity.CompletedAt,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    public static Job? ToModel(this JobEntity? entity)
        => entity is null
           ? null
           : new Job {
               Id = entity.Id,
               OwnerId = entity.OwnerId,
               Type = entity.Type,
               Status = entity.Status,
               EstimatedDuration = entity.EstimatedDuration,
               StartedAt = entity.StartedAt,
               CompletedAt = entity.CompletedAt,
               Items = entity.Items.Select(ToModel).ToList()!,
           };

    [return: NotNullIfNotNull(nameof(entity))]
    public static JobItem? ToModel(this JobItemEntity? entity)
        => entity is null
           ? null
           : new JobItem {
               Job = new Job { Id = entity.JobId },
               Index = entity.Index,
               Status = entity.Status,
               Data = entity.Data,
               Message = entity.Message,
               StartedAt = entity.StartedAt,
               CompletedAt = entity.CompletedAt,
           };

    public static JobEntity ToEntity(this Job model)
        => new() {
            Id = model.Id,
            OwnerId = model.OwnerId,
            Type = model.Type,
            Status = model.Status,
            EstimatedDuration = model.EstimatedDuration,
            StartedAt = model.StartedAt,
            CompletedAt = model.CompletedAt,
            Items = model.Items.ConvertAll(i => i.ToEntity()),
        };

    public static JobItemEntity ToEntity(this JobItem model)
        => new() {
            JobId = model.Job.Id,
            Index = model.Index,
            Status = model.Status,
            Data = model.Data,
            Message = model.Message,
            StartedAt = model.StartedAt,
            CompletedAt = model.CompletedAt,
        };

    public static void UpdateFrom(this JobEntity entity, Job model) {
        entity.Id = model.Id;
        entity.OwnerId = model.OwnerId;
        entity.Type = model.Type;
        entity.Status = model.Status;
        entity.EstimatedDuration = model.EstimatedDuration;
        entity.StartedAt = model.StartedAt;
        entity.CompletedAt = model.CompletedAt;
        entity.Items = model.Items.ConvertAll(i => i.ToEntity());
    }
}