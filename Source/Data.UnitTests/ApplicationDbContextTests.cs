namespace VttTools.Data;

public class ApplicationDbContextTests {
    [Fact]
    public void DbContext_HasRequiredDbSets() {
        // Assert
        var properties = typeof(ApplicationDbContext).GetProperties()
            .Where(p => p.PropertyType.IsGenericType &&
                        p.PropertyType.GetGenericTypeDefinition() == typeof(DbSet<>))
            .ToList();

        // Check for essential DbSets
        properties.Should().Contain(p => p.Name == "Adventures");
        properties.Should().Contain(p => p.Name == "Encounters");
        properties.Should().Contain(p => p.Name == "Assets");
        properties.Should().Contain(p => p.Name == "GameSessions");

        // Check for identity DbSets via base class
        properties.Should().Contain(p => p.Name == "Users");
        properties.Should().Contain(p => p.Name == "Roles");
        properties.Should().Contain(p => p.Name == "UserTokens");
        properties.Should().Contain(p => p.Name == "UserRoles");
        properties.Should().Contain(p => p.Name == "UserClaims");
        properties.Should().Contain(p => p.Name == "RoleClaims");
        properties.Should().Contain(p => p.Name == "UserLogins");
    }
}