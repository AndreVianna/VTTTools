using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using VttTools.WebApp.Client.Clients;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

builder.Services.AddAuthorizationCore();
builder.Services.AddCascadingAuthenticationState();
builder.Services.AddAuthenticationStateDeserialization();

// Register HTTP client
builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

// Register clients
builder.Services.AddScoped<ILibraryClient, LibraryClient>();
builder.Services.AddScoped<IAssetsClient, AssetsClient>();

await builder.Build().RunAsync();