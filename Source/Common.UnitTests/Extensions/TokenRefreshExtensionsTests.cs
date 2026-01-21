
namespace VttTools.Extensions;

public class TokenRefreshExtensionsTests {
    [Fact]
    public void UseTokenRefresh_AddsMiddleware() {
        var services = new ServiceCollection();
        services.AddLogging();
        var serviceProvider = services.BuildServiceProvider();
        var appBuilder = new ApplicationBuilder(serviceProvider);

        var result = appBuilder.UseTokenRefresh();

        result.Should().BeSameAs(appBuilder);
        var app = appBuilder.Build();
        app.Should().NotBeNull();
    }

    [Fact]
    public void UseTokenRefresh_ReturnsSameApplicationBuilder() {
        var services = new ServiceCollection();
        services.AddLogging();
        var serviceProvider = services.BuildServiceProvider();
        var appBuilder = new ApplicationBuilder(serviceProvider);

        var result = appBuilder.UseTokenRefresh();

        result.Should().BeSameAs(appBuilder);
    }

    [Fact]
    public void UseTokenRefresh_CanBeCalledMultipleTimes() {
        var services = new ServiceCollection();
        services.AddLogging();
        var serviceProvider = services.BuildServiceProvider();
        var appBuilder = new ApplicationBuilder(serviceProvider);

        var result1 = appBuilder.UseTokenRefresh();
        var result2 = appBuilder.UseTokenRefresh();

        result1.Should().BeSameAs(appBuilder);
        result2.Should().BeSameAs(appBuilder);
    }
}