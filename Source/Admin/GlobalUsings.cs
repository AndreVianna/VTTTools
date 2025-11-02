global using System.Diagnostics.CodeAnalysis;
global using System.Security.Claims;
global using System.Threading.RateLimiting;

global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.AspNetCore.RateLimiting;
global using Microsoft.AspNetCore.SignalR;

global using VttTools.Admin.ApiContracts;
global using VttTools.Admin.EndpointMappers;
global using VttTools.Admin.Handlers;
global using VttTools.Admin.Services;
global using VttTools.Audit.Model;
global using VttTools.Audit.Services;
global using VttTools.Audit.Storage;
global using VttTools.Auth.Services;
global using VttTools.Data;
global using VttTools.Data.Audit;
global using VttTools.Data.Extensions;
global using VttTools.Data.Options;
global using VttTools.Extensions;
global using VttTools.HealthChecks;
global using VttTools.Identity.Model;
global using VttTools.Services;
