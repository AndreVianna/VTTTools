
global using System.Collections.Specialized;
global using System.Diagnostics.CodeAnalysis;
global using System.IdentityModel.Tokens.Jwt;
global using System.Net.Http.Headers;
global using System.Security.Claims;
global using System.Security.Cryptography;
global using System.Text;

global using Domain.Contracts.Account;
global using Domain.Contracts.SignIn;
global using Domain.Model;

global using DotNetToolbox.Results;

global using HttpServices.Abstractions.Model;
global using HttpServices.Data;

global using IdentityService.Data;

global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.WebUtilities;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.EntityFrameworkCore.Infrastructure;
global using Microsoft.EntityFrameworkCore.Migrations;
global using Microsoft.Extensions.Caching.Distributed;
global using Microsoft.Extensions.Diagnostics.HealthChecks;
global using Microsoft.Extensions.Options;
global using Microsoft.IdentityModel.Tokens;

global using OpenTelemetry;
global using OpenTelemetry.Metrics;
global using OpenTelemetry.Trace;

global using static System.Ensure;
