namespace VttTools.Data;

internal static class DataProvider {
    public const string ConnectionStringName = "Application";

    public static string GetConnectionString(IConfigurationRoot config)
        => config.GetConnectionString(ConnectionStringName)
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
}
