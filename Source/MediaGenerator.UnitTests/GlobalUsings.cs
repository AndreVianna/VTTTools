global using System.Diagnostics;
global using System.Net;
global using System.Net.Http;
global using System.Text.Json;

global using AwesomeAssertions;

global using DotNetToolbox.Results;

global using Microsoft.Extensions.Configuration;

global using NSubstitute;

global using SixLabors.ImageSharp;
global using SixLabors.ImageSharp.PixelFormats;
global using SixLabors.ImageSharp.Processing;

global using VttTools.AI.ApiContracts;
global using VttTools.AI.ServiceContracts;
global using VttTools.AI.Services;
global using VttTools.Assets.Model;
global using VttTools.Common.Model;
global using VttTools.Jobs.Model;
global using VttTools.Media.Model;
global using VttTools.MediaGenerator.Application.Commands;
global using VttTools.MediaGenerator.Application.Options;
global using VttTools.MediaGenerator.Domain.Diagnostics.Enums;
global using VttTools.MediaGenerator.Domain.Diagnostics.Models;
global using VttTools.MediaGenerator.Domain.Images.Contracts;
global using VttTools.MediaGenerator.Domain.Prompts.Contracts;
global using VttTools.MediaGenerator.Domain.Prompts.Models;
global using VttTools.MediaGenerator.Domain.Storage.Contracts;
global using VttTools.MediaGenerator.Infrastructure.Storage;