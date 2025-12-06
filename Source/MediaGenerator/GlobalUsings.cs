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
global using VttTools.MediaGenerator.Application.HealthChecks;
global using VttTools.MediaGenerator.Application.Options;
global using VttTools.MediaGenerator.Application.Validation;
global using VttTools.MediaGenerator.Domain.Diagnostics.Contracts;
global using VttTools.MediaGenerator.Domain.Diagnostics.Enums;
global using VttTools.MediaGenerator.Domain.Diagnostics.Models;
global using VttTools.MediaGenerator.Domain.Images.Contracts;
global using VttTools.MediaGenerator.Domain.Images.Models;
global using VttTools.MediaGenerator.Domain.Prompts.Contracts;
global using VttTools.MediaGenerator.Domain.Prompts.Models;
global using VttTools.MediaGenerator.Domain.Storage.Contracts;
global using VttTools.MediaGenerator.Infrastructure.Clients.Google;
global using VttTools.MediaGenerator.Infrastructure.Clients.OpenAi;
global using VttTools.MediaGenerator.Infrastructure.Clients.StabilityAi;
global using VttTools.MediaGenerator.Infrastructure.Output;
global using VttTools.MediaGenerator.Infrastructure.Storage;