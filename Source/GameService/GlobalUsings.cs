global using System.Diagnostics.CodeAnalysis;
global using System.Net;
global using System.Security.Claims;
global using System.Text.Json;
global using System.Text.Json.Serialization;

global using DotNetToolbox;
global using DotNetToolbox.Results;
global using DotNetToolbox.Validation;

global using GameService.Middlewares;
global using GameService.Services.Game;
global using GameService.Utilities;

global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.Extensions.Diagnostics.HealthChecks;

global using OpenTelemetry;
global using OpenTelemetry.Metrics;
global using OpenTelemetry.Trace;

global using VttTools.Data;
global using VttTools.Data.Game;
global using VttTools.HttpContracts.Game;
global using VttTools.Model.Game;
global using VttTools.Model.Identity;
global using VttTools.Services.Game;
global using VttTools.Storage.Game;

global using static DotNetToolbox.Ensure;
