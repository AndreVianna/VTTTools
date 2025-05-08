namespace VttTools.Data.Options;

public class ApplicationDbContextOptionsTests {
    [Fact]
    public void ConnectionStringName_HasCorrectValue()
        => ApplicationDbContextOptions.Name.Should().Be("database");
}

public class AzureStorageOptionsTests {
    [Fact]
    public void ConnectionStringName_HasCorrectValue()
        => AzureStorageOptions.ConnectionStringName.Should().Be("blobs");
}