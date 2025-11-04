global using System.Security.Claims;

global using AwesomeAssertions;

global using Microsoft.AspNetCore.Http;
global using Microsoft.AspNetCore.Http.HttpResults;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.Extensions.Logging;

global using MockQueryable;

global using NSubstitute;
global using NSubstitute.ExceptionExtensions;

global using VttTools.Admin.ApiContracts;
global using VttTools.Admin.Exceptions;
global using VttTools.Admin.Handlers;
global using VttTools.Admin.Services;
global using VttTools.Audit.Model;
global using VttTools.Audit.Services;
global using VttTools.Audit.Storage;
global using VttTools.Auth.Services;
global using VttTools.Data;
global using VttTools.Domain.Admin.ApiContracts;
global using VttTools.Domain.Admin.Services;
global using VttTools.Identity.Model;
global using VttTools.Maintenance.ApiContracts;
global using VttTools.Maintenance.Model;
global using VttTools.Maintenance.Services;
global using VttTools.Maintenance.Storage;
global using VttTools.Services;

global using Xunit;
