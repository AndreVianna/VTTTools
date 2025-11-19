global using System.CommandLine;
global using System.Diagnostics;
global using System.Net.Http.Headers;
global using System.Net.Http.Json;
global using System.Security;
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

global using VttTools.AssetImageManager.Application.HealthChecks;
global using VttTools.AssetImageManager.Application.Options;
global using VttTools.AssetImageManager.Domain.Common.ServiceContracts;
global using VttTools.AssetImageManager.Domain.Diagnostics.Contracts;
global using VttTools.AssetImageManager.Domain.Diagnostics.Enums;
global using VttTools.AssetImageManager.Domain.Diagnostics.Models;
global using VttTools.AssetImageManager.Domain.Images.Contracts;
global using VttTools.AssetImageManager.Domain.Images.Models;
global using VttTools.AssetImageManager.Domain.Prompts.Contracts;
global using VttTools.AssetImageManager.Domain.Prompts.Models;
global using VttTools.AssetImageManager.Domain.Shared;
global using VttTools.AssetImageManager.Domain.Tokens.Models;
global using VttTools.AssetImageManager.Domain.Tokens.ServiceContracts;
global using VttTools.AssetImageManager.Domain.Tokens.ValueObjects;
global using VttTools.AssetImageManager.Infrastructure.Diagnostics;
global using VttTools.AssetImageManager.Infrastructure.Clients;
global using VttTools.AssetImageManager.Infrastructure.Storage;
