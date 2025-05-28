namespace VttTools.Data.Options;

public class ApplicationDbContextOptionsTests {
    [Fact]
    public void ConnectionStringName_HasCorrectValue()
        => ApplicationDbContextOptions.ConnectionStringName.Should().Be("database");
}