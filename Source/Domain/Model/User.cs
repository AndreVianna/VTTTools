namespace Domain.Model;

public class User
    : HttpServices.Abstractions.Model.User {

    [ProtectedPersonalData]
    public string? Name { get; set; }

    [ProtectedPersonalData]
    public string? PreferredName { get; set; }
}
