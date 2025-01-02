using HttpServices.Abstractions.Model;

using Microsoft.AspNetCore.Identity;

namespace Domain.Model;

public class User
    : NamedUser {
    [ProtectedPersonalData]
    public virtual string? PreferredName { get; set; }
}
