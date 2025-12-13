namespace VttTools.AI.Services;

public interface IGenerationService<in TData, TResult> {
    IReadOnlyList<string> GetAvailableProviders();
    Task<Result<TResult>> GenerateAsync(TData data, CancellationToken ct = default);
}
