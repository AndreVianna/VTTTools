
global using System.ComponentModel.DataAnnotations;
global using System.Diagnostics.CodeAnalysis;
global using System.IdentityModel.Tokens.Jwt;
global using System.Net.Http.Headers;
global using System.Security.Claims;
global using System.Security.Cryptography;
global using System.Text;

global using AuthService.Account;
global using AuthService.Data;
global using AuthService.Data.Model;
global using AuthService.Handlers;
global using AuthService.Handlers.Account;
global using AuthService.Handlers.ApiClient;
global using AuthService.Handlers.Contact;
global using AuthService.Handlers.SignIn;
global using AuthService.Services;

global using Domain.Auth;
global using Domain.Contracts.Account;
global using Domain.Contracts.SignIn;

global using DotNetToolbox.Results;

global using Microsoft.AspNetCore.Authentication.JwtBearer;
global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.Components;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
global using Microsoft.AspNetCore.WebUtilities;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.EntityFrameworkCore.Infrastructure;
global using Microsoft.EntityFrameworkCore.Metadata.Builders;
global using Microsoft.EntityFrameworkCore.Migrations;
global using Microsoft.EntityFrameworkCore.ValueGeneration;
global using Microsoft.Extensions.Diagnostics.HealthChecks;
global using Microsoft.Extensions.Options;
global using Microsoft.IdentityModel.Tokens;

global using OpenTelemetry;
global using OpenTelemetry.Metrics;
global using OpenTelemetry.Trace;

global using StackExchange.Redis;
