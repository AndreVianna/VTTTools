namespace HttpServices.Abstractions.Contracts.Client;

public record RegisterClientRequest : IValidatable {
    public required string Name { get; set; }

    public virtual Result Validate(IMap? context = null) {
        var result = Result.Success();
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("Name is required.", nameof(Name));
        return result;
    }
}