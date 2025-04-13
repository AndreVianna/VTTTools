global using System.Diagnostics.CodeAnalysis;
global using System.Text.Json;
global using System.Text.Json.Serialization;

global using Domain.Model;
global using Domain.Storage;

global using GameService.Services;
global using GameService.Utilities;

global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.Http.Json;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.Extensions.Diagnostics.HealthChecks;

global using OpenTelemetry;
global using OpenTelemetry.Metrics;
global using OpenTelemetry.Trace;

global using VttTools.Data;

global using static DotNetToolbox.Ensure;
