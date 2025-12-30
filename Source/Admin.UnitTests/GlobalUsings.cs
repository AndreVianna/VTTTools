global using System.Security.Claims;

global using AwesomeAssertions;

global using DotNetToolbox.Results;

global using Microsoft.AspNetCore.Hosting;
global using Microsoft.AspNetCore.Http;
global using Microsoft.AspNetCore.Http.HttpResults;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.Extensions.Logging;
global using Microsoft.Extensions.Options;

global using MockQueryable;

global using NSubstitute;
global using NSubstitute.ExceptionExtensions;

global using VttTools.Admin.Audit.ApiContracts;
global using VttTools.Admin.Audit.Handlers;
global using VttTools.Admin.Auth.ApiContracts;
global using VttTools.Admin.Auth.Handlers;
global using VttTools.Admin.Auth.Services;
global using VttTools.Admin.Configuration.ApiContracts;
global using VttTools.Admin.Configuration.Handlers;
global using VttTools.Admin.Configuration.Services;
global using VttTools.Admin.Dashboard.ApiContracts;
global using VttTools.Admin.Dashboard.Handlers;
global using VttTools.Admin.Dashboard.Services;
global using VttTools.Admin.Exceptions;
global using VttTools.Admin.Library.ApiContracts;
global using VttTools.Admin.Library.Handlers;
global using VttTools.Admin.Library.Services;
global using VttTools.Admin.Resources.ApiContracts;
global using VttTools.Admin.Resources.Clients;
global using VttTools.Admin.Resources.ServiceContracts;
global using VttTools.Admin.Resources.Services;
global using VttTools.Admin.Users.ApiContracts;
global using VttTools.Admin.Users.Handlers;
global using VttTools.Admin.Users.Services;
global using VttTools.AI.ApiContracts;
global using VttTools.AI.Model;
global using VttTools.Assets.ApiContracts;
global using VttTools.Assets.Model;
global using VttTools.Assets.Storage;
global using VttTools.Audit.Model;
global using VttTools.Audit.Services;
global using VttTools.Audit.Storage;
global using VttTools.Auth.Services;
global using VttTools.Common.Model;
global using VttTools.Configuration;
global using VttTools.Identity.Model;
global using VttTools.Json;
global using VttTools.Library.Adventures.Storage;
global using VttTools.Library.Campaigns.Storage;
global using VttTools.Library.Common;
global using VttTools.Library.Encounters.Storage;
global using VttTools.Library.Worlds.Storage;
global using VttTools.Maintenance.ApiContracts;
global using VttTools.Maintenance.Model;
global using VttTools.Maintenance.Services;
global using VttTools.Maintenance.Storage;
global using VttTools.Media.Model;
global using VttTools.Services;

global using Xunit;

global using IResult = Microsoft.AspNetCore.Http.IResult;
global using UpdateResourceRequest = VttTools.Media.ApiContracts.UpdateResourceRequest;