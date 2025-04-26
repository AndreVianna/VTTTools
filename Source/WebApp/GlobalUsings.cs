global using System.ComponentModel.DataAnnotations;
global using System.Diagnostics.CodeAnalysis;
global using System.Globalization;
global using System.Net.Http;
global using System.Net.Http.Json;
global using System.Security.Claims;
global using System.Text;
global using System.Text.Encodings.Web;
global using System.Text.Json;

global using DotNetToolbox.Results;

global using Microsoft.AspNetCore.Antiforgery;
global using Microsoft.AspNetCore.Authentication;
global using Microsoft.AspNetCore.Components;
global using Microsoft.AspNetCore.Components.Authorization;
global using Microsoft.AspNetCore.Components.Forms;
global using Microsoft.AspNetCore.Components.Routing;
global using Microsoft.AspNetCore.Components.Server;
global using Microsoft.AspNetCore.Components.Web;
global using Microsoft.AspNetCore.Http.Extensions;
global using Microsoft.AspNetCore.Http.Features;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.Identity.UI.Services;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.AspNetCore.SignalR.Client;
global using Microsoft.AspNetCore.WebUtilities;
global using Microsoft.Extensions.Diagnostics.HealthChecks;
global using Microsoft.Extensions.Options;
global using Microsoft.Extensions.Primitives;

global using VttTools.Contracts.Game;
global using VttTools.Data;
global using VttTools.Model.Game;
global using VttTools.Model.Identity;
global using VttTools.WebApp.Components;
global using VttTools.WebApp.Extensions;
global using VttTools.WebApp.Pages.Account;
global using VttTools.WebApp.Pages.Account.Manage;
global using VttTools.WebApp.Services;
global using VttTools.WebApp.Utilities;
global using VttTools.WebApp.ViewModels;

global using InputError = DotNetToolbox.Error;