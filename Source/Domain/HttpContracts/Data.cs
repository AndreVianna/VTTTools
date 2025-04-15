namespace VttTools.HttpContracts;

public abstract record Data
    : IValidatable {
    public Result Validate(IMap? context = null) => Result.Success();
}
