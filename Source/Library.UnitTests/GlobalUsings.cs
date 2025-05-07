global using System.Diagnostics.CodeAnalysis;
global using System.Security.Claims;
global using System.Text.Json;
global using System.Text.Json.Serialization;

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

global using VttTools.Common.Model;
global using VttTools.Data.Library;
global using VttTools.Extensions;
global using VttTools.Library.Adventures.ApiContracts;
global using VttTools.Library.Adventures.Model;
global using VttTools.Library.Adventures.Services;
global using VttTools.Library.Adventures.Storage;
global using VttTools.Library.Scenes.ApiContracts;
global using VttTools.Library.Scenes.Model;
global using VttTools.Library.Scenes.ServiceContracts;
global using VttTools.Library.Scenes.Services;
global using VttTools.Library.Scenes.Storage;
global using VttTools.Library.Services;
global using VttTools.Utilities;

global using Xunit;