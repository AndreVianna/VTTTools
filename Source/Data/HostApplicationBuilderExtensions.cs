namespace VttTools.Data;

public static class HostApplicationBuilderExtensions {
    public static void AddSqlServerDataProvider(this IHostApplicationBuilder builder, Action<SqlServerDbContextOptionsBuilder>? setup = null) {
        var connectionString = DataProvider.GetConnectionString(builder.Configuration.Build());
        builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString, setup));
    }
}