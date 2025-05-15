global using System.Diagnostics.CodeAnalysis;
global using System.Security.Claims;
global using System.Text.Json;
global using System.Text.Json.Serialization;

global using Azure;
global using Azure.Storage.Blobs;
global using Azure.Storage.Blobs.Models;

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
global using Microsoft.Extensions.Diagnostics.HealthChecks;
global using Microsoft.Extensions.Hosting;
global using Microsoft.Extensions.Logging;
global using Microsoft.Extensions.Logging.Abstractions;
global using Microsoft.Extensions.Options;

global using NSubstitute;

global using VttTools.Assets.ApiContracts;
global using VttTools.Assets.Model;
global using VttTools.Assets.ServiceContracts;
global using VttTools.Assets.Services;
global using VttTools.Assets.Storage;
global using VttTools.Common.Model;
global using VttTools.Data.Assets;
global using VttTools.Extensions;
global using VttTools.Utilities;

global using Xunit;