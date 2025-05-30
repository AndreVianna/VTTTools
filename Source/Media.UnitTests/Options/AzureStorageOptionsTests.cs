namespace VttTools.Media.Options;

public class AzureStorageOptionsTests {
    [Fact]
    public void ConnectionStringName_HasCorrectValue()
        => AzureStorageOptions.ConnectionStringName.Should().Be("blobs");
}