namespace VttTools.Model.Identity;

public class Role
    : IdentityRole<Guid> {
    public override Guid Id { get; set; } = Guid.CreateVersion7();
}