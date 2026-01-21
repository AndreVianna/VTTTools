namespace VttTools.Common.ServiceContracts;

public abstract record Data
    : IValidatable {
    public virtual Result Validate(IMap? context = null) => Result.Success();
}