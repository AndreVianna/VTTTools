namespace VttTools.Contracts;

public abstract record Data
    : IValidatable {
    public virtual Result Validate(IMap? context = null) => Result.Success();
}
