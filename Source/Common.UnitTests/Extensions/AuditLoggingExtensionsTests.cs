
namespace VttTools.Extensions;

public class AuditLoggingExtensionsTests {
    [Fact]
    public void AddAuditLogging_ConfiguresOptions() {
        var builder = new HostApplicationBuilder();

        var result = builder.AddAuditLogging();

        result.Should().BeSameAs(builder);
        builder.Services.Should().Contain(s => s.ServiceType == typeof(IConfigureOptions<AuditLoggingOptions>));
    }

    [Fact]
    public void AddAuditLogging_ReturnsSameBuilder() {
        var builder = new HostApplicationBuilder();

        var result = builder.AddAuditLogging();

        result.Should().BeSameAs(builder);
    }

    [Fact]
    public void UseAuditLogging_AddsMiddleware() {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton(Substitute.For<IAuditLogStorage>());
        services.AddSingleton(Substitute.For<IAuditLogService>());

        var serviceProvider = services.BuildServiceProvider();
        var appBuilder = new ApplicationBuilder(serviceProvider);

        var result = appBuilder.UseAuditLogging();

        result.Should().BeSameAs(appBuilder);
        var app = appBuilder.Build();
        app.Should().NotBeNull();
    }

    [Fact]
    public void UseAuditLogging_ReturnsSameApplicationBuilder() {
        var services = new ServiceCollection();
        services.AddLogging();
        var serviceProvider = services.BuildServiceProvider();
        var appBuilder = new ApplicationBuilder(serviceProvider);

        var result = appBuilder.UseAuditLogging();

        result.Should().BeSameAs(appBuilder);
    }
}