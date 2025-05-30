global using System.Diagnostics.CodeAnalysis;
global using System.Net;
global using System.Security.Claims;

global using DotNetToolbox;
global using DotNetToolbox.Results;

global using AwesomeAssertions;

global using Microsoft.AspNetCore.Builder;
global using Microsoft.AspNetCore.Http;
global using Microsoft.AspNetCore.Http.HttpResults;
global using Microsoft.AspNetCore.Routing;
global using Microsoft.Extensions.Hosting;

global using NSubstitute;

global using VttTools.Data.Game;
global using VttTools.Extensions;
global using VttTools.Game.Services;
global using VttTools.Game.Sessions.ApiContracts;
global using VttTools.Game.Sessions.Model;
global using VttTools.Game.Sessions.ServiceContracts;
global using VttTools.Game.Sessions.Services;
global using VttTools.Game.Sessions.Storage;

global using Xunit;