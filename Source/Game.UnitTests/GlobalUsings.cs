global using System.Diagnostics.CodeAnalysis;
global using System.Net;
global using System.Security.Claims;
global using System.Text.Json;
global using System.Text.Json.Serialization;

global using DotNetToolbox;
global using DotNetToolbox.Results;

global using FluentAssertions;

global using Microsoft.AspNetCore.Authentication;
global using Microsoft.AspNetCore.Builder;
global using Microsoft.AspNetCore.Cors.Infrastructure;
global using Microsoft.AspNetCore.Diagnostics;
global using Microsoft.AspNetCore.Hosting;
global using Microsoft.AspNetCore.Http;
global using Microsoft.AspNetCore.Http.HttpResults;
global using Microsoft.AspNetCore.Http.Json;
global using Microsoft.AspNetCore.Routing;
global using Microsoft.Extensions.DependencyInjection;
global using Microsoft.Extensions.Diagnostics.HealthChecks;
global using Microsoft.Extensions.Hosting;
global using Microsoft.Extensions.Logging;
global using Microsoft.Extensions.Logging.Abstractions;
global using Microsoft.Extensions.Options;

global using NSubstitute;

global using VttTools.Data.Game;
global using VttTools.Extensions;
global using VttTools.Game.Endpoints;
global using VttTools.Game.Services;
global using VttTools.Game.Sessions.ApiContracts;
global using VttTools.Game.Sessions.Model;
global using VttTools.Game.Sessions.ServiceContracts;
global using VttTools.Game.Sessions.Services;
global using VttTools.Game.Sessions.Storage;
global using VttTools.Utilities;

global using Xunit;