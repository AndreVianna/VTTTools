global using System.CommandLine;
global using System.Diagnostics;
global using System.Net.Http.Headers;
global using System.Net.Http.Json;
global using System.Text;
global using System.Text.Json;
global using System.Text.Json.Serialization;
global using System.Text.RegularExpressions;

global using DotNetToolbox;
global using DotNetToolbox.Results;
global using DotNetToolbox.Validation;

global using Microsoft.Extensions.Configuration;
global using Microsoft.Extensions.DependencyInjection;

global using SixLabors.ImageSharp;
global using SixLabors.ImageSharp.Processing;

global using VttTools.Assets.Model;
global using VttTools.Media.Model;

global using VttTools.AssetImageManager.Application.Validation;
global using VttTools.AssetImageManager.Application.HealthChecks;
global using VttTools.AssetImageManager.Application.Options;
global using VttTools.AssetImageManager.Domain.Diagnostics.Contracts;
global using VttTools.AssetImageManager.Domain.Diagnostics.Enums;
global using VttTools.AssetImageManager.Domain.Diagnostics.Models;
global using VttTools.AssetImageManager.Domain.Images.Contracts;
global using VttTools.AssetImageManager.Domain.Images.Models;
global using VttTools.AssetImageManager.Domain.Prompts.Contracts;
global using VttTools.AssetImageManager.Domain.Prompts.Models;
global using VttTools.AssetImageManager.Domain.Storage.Contracts;
global using VttTools.AssetImageManager.Infrastructure.Clients.Google;
global using VttTools.AssetImageManager.Infrastructure.Clients.OpenAi;
global using VttTools.AssetImageManager.Infrastructure.Clients.StabilityAi;
global using VttTools.AssetImageManager.Infrastructure.Output;
global using VttTools.AssetImageManager.Infrastructure.Storage;
