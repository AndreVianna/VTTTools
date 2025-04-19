global using System.Diagnostics.CodeAnalysis;
global using System.IO;
global using System.Net;
global using System.Security.Claims;
global using System.Text.Json;
global using System.Text.Json.Serialization;

global using Azure.Storage.Blobs;
global using Azure.Storage.Blobs.Models;

global using DotNetToolbox;
global using DotNetToolbox.Results;
global using DotNetToolbox.Validation;

global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.Hosting;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.Extensions.Diagnostics.HealthChecks;
global using Microsoft.Extensions.FileProviders;
global using Microsoft.Extensions.Hosting;

global using OpenTelemetry;
global using OpenTelemetry.Metrics;
global using OpenTelemetry.Trace;

global using VttTools.Contracts.Game;
global using VttTools.Data;
global using VttTools.Data.Extensions;
global using VttTools.Data.Game;
global using VttTools.Data.Options;
global using VttTools.GameService.Middlewares;
global using VttTools.GameService.Services.Game;
global using VttTools.GameService.Services.Media;
global using VttTools.Model.Game;
global using VttTools.Model.Identity;
global using VttTools.Services.Game;
global using VttTools.Services.Media;
global using VttTools.Storage.Game;
global using VttTools.Utilities;

global using static DotNetToolbox.Ensure;