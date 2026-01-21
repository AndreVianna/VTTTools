namespace VttTools.AI.Providers;

public interface IProvider<TData, TResult>
    where TData : Data {
    string Name { get; }
    Task<Result<TResult>> GenerateAsync(TData data, CancellationToken ct = default);
}