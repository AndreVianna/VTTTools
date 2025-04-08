namespace WebApi.Identity.EntityFrameworkCore.Entities;

public class Role {
    public Role() { }
    public Role(string name) : this() {
        Name = name;
    }

    public Guid Id { get; set; }
    [MaxLength(64)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(64)]
    public string ConcurrencyStamp { get; set; } = Guid.CreateVersion7().ToString();
    public override string ToString() => Name;

    public ICollection<RoleClaim> Claims { get; set; } = new HashSet<RoleClaim>();
}
