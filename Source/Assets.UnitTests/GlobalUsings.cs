global using System.Diagnostics.CodeAnalysis;
global using System.Security.Claims;

global using AwesomeAssertions;

global using DotNetToolbox;
global using DotNetToolbox.Results;

global using Microsoft.AspNetCore.Builder;
global using Microsoft.AspNetCore.Http;
global using Microsoft.AspNetCore.Http.HttpResults;
global using Microsoft.AspNetCore.Routing;
global using Microsoft.Extensions.Hosting;

global using NSubstitute;

global using VttTools.Assets.ApiContracts;
global using VttTools.Assets.Model;
global using VttTools.Assets.ServiceContracts;
global using VttTools.Assets.Services;
global using VttTools.Assets.Storage;
global using VttTools.Common.Model;
global using VttTools.Data.Assets;
global using VttTools.Extensions;
global using VttTools.Media.Storage;
global using VttTools.Utilities;

global using Xunit;