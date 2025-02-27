global using System.Collections.Specialized;
global using System.Diagnostics.CodeAnalysis;
global using System.IdentityModel.Tokens.Jwt;
global using System.Net;
global using System.Net.Http.Headers;
global using System.Security.Claims;
global using System.Security.Cryptography;
global using System.Text;

global using DotNetToolbox;
global using DotNetToolbox.Results;

global using HttpServices.Abstractions.Contracts.Account;
global using HttpServices.Abstractions.Contracts.Client;
global using HttpServices.Abstractions.Contracts.SignIn;
global using HttpServices.Abstractions.Helpers;
global using HttpServices.Abstractions.Model;
global using HttpServices.Data;
global using HttpServices.Model;
global using HttpServices.Services.Account;
global using HttpServices.Services.Client;
global using HttpServices.Services.Messaging;

global using Microsoft.AspNetCore.Abstractions;
global using Microsoft.AspNetCore.Authentication;
global using Microsoft.AspNetCore.Authentication.JwtBearer;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.AspNetCore.WebUtilities;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.EntityFrameworkCore.ChangeTracking;
global using Microsoft.EntityFrameworkCore.Infrastructure;
global using Microsoft.EntityFrameworkCore.Metadata;
global using Microsoft.EntityFrameworkCore.Metadata.Builders;
global using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
global using Microsoft.EntityFrameworkCore.ValueGeneration;
global using Microsoft.Extensions.Caching.Distributed;
global using Microsoft.Extensions.Diagnostics.HealthChecks;
global using Microsoft.Extensions.Diagnostics.Metrics;
global using Microsoft.Extensions.Options;
global using Microsoft.IdentityModel.Tokens;

global using OpenTelemetry;
global using OpenTelemetry.Metrics;
global using OpenTelemetry.Trace;
