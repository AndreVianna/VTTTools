namespace VttTools.Library.Stages.Services;

public interface IStageService {
    Task<Stage[]> GetAllAsync(CancellationToken ct = default);
    Task<Stage[]> SearchAsync(string filterDefinition, CancellationToken ct = default);
    Task<Stage?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<Stage>> CreateAsync(Guid userId, CreateStageData data, CancellationToken ct = default);
    Task<Result<Stage>> CloneAsync(Guid userId, Guid templateId, CancellationToken ct = default);
    Task<Result> UpdateAsync(Guid userId, Guid id, UpdateStageData data, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid userId, Guid id, CancellationToken ct = default);

    // Wall operations
    Task<Result<StageWall>> AddWallAsync(Guid userId, Guid stageId, StageWall wall, CancellationToken ct = default);
    Task<Result> UpdateWallAsync(Guid userId, Guid stageId, ushort index, StageWall wall, CancellationToken ct = default);
    Task<Result> RemoveWallAsync(Guid userId, Guid stageId, ushort index, CancellationToken ct = default);

    // Region operations
    Task<Result<StageRegion>> AddRegionAsync(Guid userId, Guid stageId, StageRegion region, CancellationToken ct = default);
    Task<Result> UpdateRegionAsync(Guid userId, Guid stageId, ushort index, StageRegion region, CancellationToken ct = default);
    Task<Result> RemoveRegionAsync(Guid userId, Guid stageId, ushort index, CancellationToken ct = default);

    // Light operations
    Task<Result<StageLight>> AddLightAsync(Guid userId, Guid stageId, StageLight light, CancellationToken ct = default);
    Task<Result> UpdateLightAsync(Guid userId, Guid stageId, ushort index, StageLight light, CancellationToken ct = default);
    Task<Result> RemoveLightAsync(Guid userId, Guid stageId, ushort index, CancellationToken ct = default);

    // Decoration/Element operations
    Task<Result<StageElement>> AddDecorationAsync(Guid userId, Guid stageId, StageElement decoration, CancellationToken ct = default);
    Task<Result> UpdateDecorationAsync(Guid userId, Guid stageId, ushort index, StageElement decoration, CancellationToken ct = default);
    Task<Result> RemoveDecorationAsync(Guid userId, Guid stageId, ushort index, CancellationToken ct = default);

    // Sound operations
    Task<Result<StageSound>> AddSoundAsync(Guid userId, Guid stageId, StageSound sound, CancellationToken ct = default);
    Task<Result> UpdateSoundAsync(Guid userId, Guid stageId, ushort index, StageSound sound, CancellationToken ct = default);
    Task<Result> RemoveSoundAsync(Guid userId, Guid stageId, ushort index, CancellationToken ct = default);
}