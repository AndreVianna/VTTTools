namespace VttTools.Library.Stages.Services;

public interface IStageService {
    Task<Stage[]> GetAllAsync(CancellationToken ct = default);
    Task<Stage[]> SearchAsync(string filterDefinition, CancellationToken ct = default);
    Task<Stage?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<Stage>> CreateAsync(Guid userId, CreateStageData data, CancellationToken ct = default);
    Task<Result<Stage>> CloneAsync(Guid userId, Guid templateId, CancellationToken ct = default);
    Task<Result> UpdateAsync(Guid userId, Guid id, UpdateStageData data, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid userId, Guid id, CancellationToken ct = default);
}
