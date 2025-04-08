global using System.Collections.Concurrent;
global using System.ComponentModel.DataAnnotations;
global using System.Diagnostics.CodeAnalysis;

global using DotNetToolbox;

global using Microsoft.AspNetCore.Builder;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.EntityFrameworkCore.ChangeTracking;
global using Microsoft.EntityFrameworkCore.Infrastructure;
global using Microsoft.EntityFrameworkCore.ValueGeneration;
global using Microsoft.Extensions.DependencyInjection;
global using Microsoft.Extensions.Logging;

global using WebApi;
global using WebApi.Builders;
global using WebApi.DataStores;
global using WebApi.EntityFrameworkCore.Utilities;
global using WebApi.Options;
global using WebApi.Tenants.EntityFrameworkCore;
global using WebApi.Tenants.EntityFrameworkCore.Builders;
global using WebApi.Tenants.EntityFrameworkCore.DataStores;
global using WebApi.Tenants.EntityFrameworkCore.Entities;
global using WebApi.Tokens;

global using Tenant = WebApi.Model.Tenant;
global using TenantTokenEntity = WebApi.Tenants.EntityFrameworkCore.Entities.TenantToken;
global using TenantEntity = WebApi.Tenants.EntityFrameworkCore.Entities.Tenant;
