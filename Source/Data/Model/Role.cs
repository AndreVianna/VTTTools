namespace VttTools.Data.Model;

public class Role
    : IdentityRole<Guid> {
    public override Guid Id { get; set; } = Guid.CreateVersion7();
}