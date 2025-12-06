global using System.ComponentModel.DataAnnotations;
global using System.IdentityModel.Tokens.Jwt;
global using System.Security.Claims;
global using System.Text;

global using Microsoft.AspNetCore.Http;
global using Microsoft.AspNetCore.Http.HttpResults;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.Extensions.Logging;
global using Microsoft.Extensions.Options;
global using Microsoft.IdentityModel.Tokens;

global using NSubstitute;
global using NSubstitute.ExceptionExtensions;

global using VttTools.Auth.ApiContracts;
global using VttTools.Auth.Handlers;
global using VttTools.Auth.Services;
global using VttTools.Configuration;
global using VttTools.Identity.Model;
global using VttTools.Services;

global using Xunit;