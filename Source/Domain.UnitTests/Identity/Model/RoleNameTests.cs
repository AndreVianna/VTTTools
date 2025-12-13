namespace VttTools.Identity.Model;

public class RoleNameTests {
    [Fact]
    public void Enum_HasCorrectValues() {
        // Act & Assert
        ((int)RoleName.Guest).Should().Be(0);
        ((int)RoleName.User).Should().Be(1);
        ((int)RoleName.Administrator).Should().Be(99);
    }

    [Fact]
    public void Enum_CanBeConvertedToString() {
        // Act & Assert
        RoleName.Guest.ToString().Should().Be("Guest");
        RoleName.User.ToString().Should().Be("User");
        RoleName.Administrator.ToString().Should().Be("Administrator");
    }

    [Fact]
    public void Enum_CanBeParsedFromString() {
        // Act & Assert
        Enum.Parse<RoleName>("Guest").Should().Be(RoleName.Guest);
        Enum.Parse<RoleName>("User").Should().Be(RoleName.User);
        Enum.Parse<RoleName>("Administrator").Should().Be(RoleName.Administrator);
    }

    [Fact]
    public void Enum_HasAllExpectedMembers() {
        // Arrange
        var values = Enum.GetValues<RoleName>();

        // Act & Assert
        values.Should().HaveCount(3);
        values.Should().Contain(RoleName.Guest);
        values.Should().Contain(RoleName.User);
        values.Should().Contain(RoleName.Administrator);
    }

    [Fact]
    public void Enum_AdminHasHighestValue() {
        // Act & Assert
        ((int)RoleName.Guest).Should().BeLessThan((int)RoleName.User);
        ((int)RoleName.User).Should().BeLessThan((int)RoleName.Administrator);
    }
}
