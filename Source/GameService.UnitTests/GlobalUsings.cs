global using System.Diagnostics.CodeAnalysis;
global using System.Net;
global using System.Reflection;
global using System.Security.Claims;
global using System.Text;
global using System.Text.Json;
global using System.Text.Json.Serialization;

global using Azure;
global using Azure.Storage.Blobs;
global using Azure.Storage.Blobs.Models;

global using DotNetToolbox;
global using DotNetToolbox.Results;

global using FluentAssertions;

global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.Builder;
global using Microsoft.AspNetCore.Diagnostics;
global using Microsoft.AspNetCore.Hosting;
global using Microsoft.AspNetCore.Http;
global using Microsoft.AspNetCore.Http.HttpResults;
global using Microsoft.AspNetCore.Routing;
global using Microsoft.Extensions.DependencyInjection;
global using Microsoft.Extensions.Diagnostics.HealthChecks;
global using Microsoft.Extensions.Hosting;
global using Microsoft.Extensions.Logging;
global using Microsoft.Extensions.Logging.Abstractions;
global using Microsoft.Extensions.Primitives;

global using NSubstitute;
global using NSubstitute.Core;

global using VttTools.Contracts.Game;
global using VttTools.Data.Game;
global using VttTools.GameService.Extensions;
global using VttTools.GameService.Handlers;
global using VttTools.GameService.Services.Game;
global using VttTools.GameService.Services.Media;
global using VttTools.Model.Game;
global using VttTools.Services.Game;
global using VttTools.Services.Media;
global using VttTools.Storage.Game;
global using VttTools.Utilities;

global using Xunit;