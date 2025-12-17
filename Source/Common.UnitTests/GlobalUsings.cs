global using System.Data.Common;
global using System.Security.Claims;
global using System.Text;
global using System.Text.Json;

global using AwesomeAssertions;

global using Azure;
global using Azure.Storage.Blobs.Models;

global using Microsoft.AspNetCore.Builder;
global using Microsoft.AspNetCore.Hosting;
global using Microsoft.AspNetCore.Http;
global using Microsoft.AspNetCore.Http.Json;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.Routing;
global using Microsoft.Data.SqlClient;
global using Microsoft.Extensions.Configuration;
global using Microsoft.Extensions.DependencyInjection;
global using Microsoft.Extensions.Diagnostics.HealthChecks;
global using Microsoft.Extensions.Hosting;
global using Microsoft.Extensions.Logging;
global using Microsoft.Extensions.Logging.Abstractions;
global using Microsoft.Extensions.Options;

global using NSubstitute;

global using VttTools.Admin.Configuration.Model;
global using VttTools.Audit.Model;
global using VttTools.Audit.Model.Payloads;
global using VttTools.Audit.Services;
global using VttTools.Audit.Storage;
global using VttTools.Auth.Services;
global using VttTools.Common.Model;
global using VttTools.Common.Services;
global using VttTools.Common.Utilities;
global using VttTools.Configuration;
global using VttTools.Extensions;
global using VttTools.Identity.Model;
global using VttTools.Json;
global using VttTools.Maintenance.Model;
global using VttTools.Maintenance.Services;
global using VttTools.Maintenance.Storage;
global using VttTools.Middlewares;
global using VttTools.Services;
global using VttTools.Utilities;
