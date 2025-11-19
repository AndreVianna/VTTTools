namespace VttTools.AssetImageManager.Domain.Common.ServiceContracts;

public abstract record Data
    : IValidatable {
    public virtual Result Validate(IMap? context = null) => Result.Success();
}
