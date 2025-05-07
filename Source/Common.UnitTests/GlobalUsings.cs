global using System.Collections;
global using System.Security.Claims;
global using System.Text.Json;
global using System.Text.Json.Serialization;

global using DotNetToolbox;

global using FluentAssertions;

global using Microsoft.AspNetCore.Authentication;
global using Microsoft.AspNetCore.Builder;
global using Microsoft.AspNetCore.Cors.Infrastructure;
global using Microsoft.AspNetCore.Diagnostics;
global using Microsoft.AspNetCore.Hosting;
global using Microsoft.AspNetCore.Http;
global using Microsoft.AspNetCore.Http.Json;
global using Microsoft.AspNetCore.Routing;
global using Microsoft.Extensions.DependencyInjection;
global using Microsoft.Extensions.Hosting;
global using Microsoft.Extensions.Logging;
global using Microsoft.Extensions.Logging.Abstractions;
global using Microsoft.Extensions.Options;

global using NSubstitute;

global using VttTools.Middlewares;
global using VttTools.Utilities;