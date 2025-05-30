global using System.Diagnostics;
global using System.Diagnostics.CodeAnalysis;
global using System.Net;
global using System.Net.Http.Json;
global using System.Security.Claims;
global using System.Text.Json;
global using System.Text.Json.Serialization;

global using AngleSharp.Html.Dom;

global using AwesomeAssertions;

global using Bunit;
global using Bunit.TestDoubles;

global using DotNetToolbox;
global using DotNetToolbox.Results;

global using Microsoft.AspNetCore.Authentication;
global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.Components;
global using Microsoft.AspNetCore.Components.Authorization;
global using Microsoft.AspNetCore.Connections;
global using Microsoft.AspNetCore.Http;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.SignalR.Client;
global using Microsoft.AspNetCore.SignalR.Protocol;
global using Microsoft.AspNetCore.WebUtilities;
global using Microsoft.Extensions.DependencyInjection;
global using Microsoft.Extensions.Logging;
global using Microsoft.Extensions.Logging.Abstractions;
global using Microsoft.Extensions.Options;

global using NSubstitute;
global using NSubstitute.ClearExtensions;

global using VttTools.Assets.ApiContracts;
global using VttTools.Assets.Model;
global using VttTools.Common.Model;
global using VttTools.Game.Sessions.ApiContracts;
global using VttTools.Game.Sessions.Model;
global using VttTools.Identity.Model;
global using VttTools.Library.Adventures.ApiContracts;
global using VttTools.Library.Adventures.Model;
global using VttTools.Library.Scenes.Model;
global using VttTools.Utilities;
global using VttTools.WebApp.Components;
global using VttTools.WebApp.Contracts.Assets;
global using VttTools.WebApp.Contracts.Game;
global using VttTools.WebApp.Contracts.Game.Chat.Models;
global using VttTools.WebApp.Contracts.Game.Sessions;
global using VttTools.WebApp.Contracts.Library;
global using VttTools.WebApp.Contracts.Library.Adventure;
global using VttTools.WebApp.Extensions;
global using VttTools.WebApp.Server.Clients;
global using VttTools.WebApp.Server.Components;
global using VttTools.WebApp.Server.Pages;
global using VttTools.WebApp.Server.Pages.Account;
global using VttTools.WebApp.Server.Pages.Account.Manage;
global using VttTools.WebApp.Server.Pages.Assets.List;
global using VttTools.WebApp.Server.Pages.Game.Chat;
global using VttTools.WebApp.Server.Pages.Game.Schedule.List;
global using VttTools.WebApp.Server.Pages.Game.Schedule.Single;
global using VttTools.WebApp.Server.Pages.Library.Adventures.List;
global using VttTools.WebApp.Server.Pages.Library.Adventures.Single;
global using VttTools.WebApp.Server.Shared.Models;
global using VttTools.WebApp.TestUtilities;
global using VttTools.WebApp.Utilities;

global using BUnitContext = Bunit.TestContext;
