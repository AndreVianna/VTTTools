global using System.Diagnostics;
global using System.Diagnostics.CodeAnalysis;
global using System.Net;
global using System.Net.Http.Json;
global using System.Reflection;
global using System.Security.Claims;
global using System.Text;
global using System.Text.Json;

global using Bunit;
global using Bunit.TestDoubles;

global using DotNetToolbox.Results;
global using FluentAssertions;
global using Microsoft.AspNetCore.Components;
global using Microsoft.AspNetCore.Components.Authorization;
global using Microsoft.AspNetCore.Components.Routing;
global using Microsoft.AspNetCore.Components.Web;
global using Microsoft.AspNetCore.Http;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.SignalR.Client;
global using Microsoft.Extensions.DependencyInjection;
global using Microsoft.Extensions.Logging;
global using Microsoft.Extensions.Logging.Abstractions;
global using Microsoft.JSInterop;

global using NSubstitute;
global using NSubstitute.ReturnsExtensions;

global using VttTools.Contracts.Game;
global using VttTools.Model.Game;
global using VttTools.Model.Identity;
global using VttTools.WebApp.Components;
global using VttTools.WebApp.Components.Meeting.Pages;
global using VttTools.WebApp.ViewModels;
global using VttTools.WebApp.Services;
global using VttTools.WebApp.Utilities;

global using Xunit;