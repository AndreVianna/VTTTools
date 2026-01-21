namespace VttTools.Media.Handlers;

public class ConfigurationHandlersTests {
    [Fact]
    public void ConfigurationHandlers_Exists() => typeof(ConfigurationHandlers).Should().NotBeNull();

    [Fact]
    public void GetInternalConfigurationHandler_MethodExists() {
        var method = typeof(ConfigurationHandlers).GetMethod("GetInternalConfigurationHandler");

        method.Should().NotBeNull();
        method.IsStatic.Should().BeTrue();
        method.ReturnType.Should().Be<Microsoft.AspNetCore.Http.IResult>();
    }
}