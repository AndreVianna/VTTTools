global using System.Diagnostics.CodeAnalysis;
global using System.Security.Claims;
global using System.Text.Encodings.Web;
global using System.Text.Json;
global using System.Text.Json.Serialization;
global using System.Text.RegularExpressions;

global using Azure.Storage.Blobs;
global using Azure.Storage.Blobs.Models;

global using Microsoft.AspNetCore.Authentication;
global using Microsoft.AspNetCore.Cors.Infrastructure;
global using Microsoft.AspNetCore.Diagnostics;
global using Microsoft.AspNetCore.Diagnostics.HealthChecks;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.Extensions.Diagnostics.HealthChecks;
global using Microsoft.Extensions.Options;

global using VttTools.Assets.ApiContracts;
global using VttTools.Assets.EndpointMappers;
global using VttTools.Assets.Extensions;
global using VttTools.Assets.Handlers;
global using VttTools.Assets.Model;
global using VttTools.Assets.Services;
global using VttTools.Assets.Storage;
global using VttTools.Data;
global using VttTools.Data.Extensions;
global using VttTools.Data.Options;
global using VttTools.Extensions;
global using VttTools.Middlewares;
global using VttTools.Utilities;