using HttpServices.Abstractions.Model;

using Microsoft.AspNetCore.Identity;

namespace Domain.Model;

public class User
    : HttpServices.Abstractions.Model.User {
    [ProtectedPersonalData]
    public virtual string? PreferredName { get; set; }
}
