global using System.Security.Claims;
global using System.Text.Encodings.Web;
global using System.Text.Json;
global using System.Text.Json.Serialization;
global using System.Text.RegularExpressions;

global using DotNetToolbox.Results;

global using Microsoft.Extensions.Configuration;

global using Microsoft.AspNetCore.Authentication;
global using Microsoft.AspNetCore.Builder;
global using Microsoft.AspNetCore.Diagnostics;
global using Microsoft.AspNetCore.Diagnostics.HealthChecks;
global using Microsoft.AspNetCore.Hosting;
global using Microsoft.AspNetCore.Http;
global using Microsoft.AspNetCore.Routing;
global using Microsoft.Extensions.DependencyInjection;
global using Microsoft.Extensions.Diagnostics.HealthChecks;
global using Microsoft.Extensions.Hosting;
global using Microsoft.Extensions.Logging;
global using Microsoft.Extensions.Options;

global using SixLabors.ImageSharp;
global using SixLabors.ImageSharp.Formats.Gif;
global using SixLabors.ImageSharp.Formats.Webp;

global using VttTools.EndpointMappers;
global using VttTools.HealthChecks;
global using VttTools.Media.Model;
global using VttTools.Media.ServiceContracts;
global using VttTools.Middlewares;
global using VttTools.Utilities;