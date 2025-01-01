﻿
global using System.Collections.Specialized;
global using System.ComponentModel.DataAnnotations;
global using System.Diagnostics.CodeAnalysis;
global using System.IdentityModel.Tokens.Jwt;
global using System.Net.Http.Headers;
global using System.Security.Claims;
global using System.Security.Cryptography;
global using System.Text;

global using Domain.Auth;
global using Domain.Contracts.Account;
global using Domain.Contracts.SignIn;

global using DotNetToolbox.Results;

global using IdentityService.Account;
global using IdentityService.Data;
global using IdentityService.Data.Model;
global using IdentityService.Handlers;
global using IdentityService.Handlers.Account;
global using IdentityService.Handlers.ApiClient;
global using IdentityService.Handlers.Contact;
global using IdentityService.Handlers.SignIn;
global using IdentityService.Services;

global using Microsoft.AspNetCore.Authentication.JwtBearer;
global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
global using Microsoft.AspNetCore.WebUtilities;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.EntityFrameworkCore.Infrastructure;
global using Microsoft.EntityFrameworkCore.Metadata.Builders;
global using Microsoft.EntityFrameworkCore.Migrations;
global using Microsoft.EntityFrameworkCore.ValueGeneration;
global using Microsoft.Extensions.Caching.Distributed;
global using Microsoft.Extensions.Diagnostics.HealthChecks;
global using Microsoft.Extensions.Options;
global using Microsoft.IdentityModel.Tokens;

global using OpenTelemetry;
global using OpenTelemetry.Metrics;
global using OpenTelemetry.Trace;