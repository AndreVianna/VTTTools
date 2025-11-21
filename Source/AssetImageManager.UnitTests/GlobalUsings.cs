global using System.Net;
global using System.Net.Http;
global using System.Text.Json;

global using AwesomeAssertions;

global using Microsoft.Extensions.Configuration;

global using NSubstitute;

global using VttTools.AssetImageManager.Application.Commands;
global using VttTools.AssetImageManager.Application.Options;
global using VttTools.AssetImageManager.Application.Services;
global using VttTools.AssetImageManager.Domain.Diagnostics.Enums;
global using VttTools.AssetImageManager.Domain.Diagnostics.Models;
global using VttTools.AssetImageManager.Domain.Files.Contracts;
global using VttTools.AssetImageManager.Domain.Images.Contracts;
global using VttTools.AssetImageManager.Domain.Prompts.Contracts;
global using VttTools.AssetImageManager.Domain.Prompts.Models;
global using VttTools.AssetImageManager.Domain.Shared;
global using VttTools.AssetImageManager.Domain.Tokens.Models;
global using VttTools.AssetImageManager.Domain.Tokens.ServiceContracts;
global using VttTools.AssetImageManager.Infrastructure.Storage;
global using VttTools.AssetImageManager.UnitTests.Fixtures;
global using VttTools.AssetImageManager.UnitTests.Mocks;
