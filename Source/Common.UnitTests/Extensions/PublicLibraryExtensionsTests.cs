
namespace VttTools.Common.UnitTests.Extensions;

public class PublicLibraryExtensionsTests {
    [Fact]
    public void AddPublicLibrary_ConfiguresOptions() {
        var builder = new HostApplicationBuilder();

        var result = builder.AddPublicLibrary();

        result.Should().BeSameAs(builder);
        builder.Services.Should().Contain(s => s.ServiceType == typeof(IConfigureOptions<PublicLibraryOptions>));
    }

    [Fact]
    public void AddPublicLibrary_ReturnsSameBuilder() {
        var builder = new HostApplicationBuilder();

        var result = builder.AddPublicLibrary();

        result.Should().BeSameAs(builder);
    }

    [Fact]
    public void AddPublicLibrary_DoesNotThrow() {
        var builder = new HostApplicationBuilder();

        var act = () => builder.AddPublicLibrary();

        act.Should().NotThrow();
    }
}
