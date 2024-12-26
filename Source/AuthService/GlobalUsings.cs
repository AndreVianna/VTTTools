global using System.ComponentModel.DataAnnotations;
global using System.ComponentModel.DataAnnotations.Schema;
global using System.IdentityModel.Tokens.Jwt;
global using System.Text;
global using System.Text.Encodings.Web;

global using AuthService.Account;
global using AuthService.Data;
global using AuthService.Data.Model;
global using AuthService.Handlers.Account;
global using AuthService.Services;

global using Domain.Auth;

global using DotNetToolbox.Results;

global using Microsoft.AspNetCore.Authentication.JwtBearer;
global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.Components;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
global using Microsoft.AspNetCore.WebUtilities;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.EntityFrameworkCore.Infrastructure;
global using Microsoft.EntityFrameworkCore.Migrations;
global using Microsoft.Extensions.Diagnostics.HealthChecks;
global using Microsoft.IdentityModel.Tokens;

global using OpenTelemetry;
global using OpenTelemetry.Metrics;
global using OpenTelemetry.Trace;

global using StackExchange.Redis;
