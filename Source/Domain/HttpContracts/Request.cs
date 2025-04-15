namespace VttTools.HttpContracts;

public abstract record Request
    : IValidatable {
    public Result Validate(IMap? context = null) => Result.Success();
}