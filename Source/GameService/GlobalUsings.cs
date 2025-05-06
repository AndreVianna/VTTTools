global using System.Diagnostics.CodeAnalysis;
global using System.IO;
global using System.Linq;
global using System.Net;
global using System.Security.Claims;
global using System.Text.Encodings.Web;
global using System.Text.Json;
global using System.Text.Json.Serialization;
global using System.Text.RegularExpressions;
global using System.Threading.Tasks;

global using Azure.Storage.Blobs;
global using Azure.Storage.Blobs.Models;

global using DotNetToolbox.Results;

global using Microsoft.AspNetCore.Authentication;
global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.Cors.Infrastructure;
global using Microsoft.AspNetCore.Diagnostics;
global using Microsoft.AspNetCore.Hosting;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.Extensions.Diagnostics.HealthChecks;
global using Microsoft.Extensions.Hosting;
global using Microsoft.Extensions.Logging;
global using Microsoft.Extensions.Options;

global using VttTools.Contracts.Game;
global using VttTools.Data;
global using VttTools.Data.Extensions;
global using VttTools.Data.Game;
global using VttTools.Data.Options;
global using VttTools.GameService.Endpoints;
global using VttTools.GameService.Extensions;
global using VttTools.GameService.Handlers;
global using VttTools.GameService.Middlewares;
global using VttTools.GameService.Services.Game;
global using VttTools.GameService.Services.Media;
global using VttTools.Model.Game;
global using VttTools.Model.Identity;
global using VttTools.Services.Game;
global using VttTools.Services.Media;
global using VttTools.Storage.Game;
global using VttTools.Utilities;