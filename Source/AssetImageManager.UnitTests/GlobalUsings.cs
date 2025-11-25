global using System.Diagnostics;
global using System.Net;
global using System.Net.Http;
global using System.Text;
global using System.Text.Json;
global using System.Text.Json.Serialization;

global using AwesomeAssertions;

global using Microsoft.Extensions.Configuration;

global using NSubstitute;

global using VttTools.Assets.Model;
global using VttTools.Common.Model;
global using VttTools.Media.Model;
global using VttTools.AssetImageManager.Application.Commands;
global using VttTools.AssetImageManager.Application.Options;
global using VttTools.AssetImageManager.Domain.Diagnostics.Enums;
global using VttTools.AssetImageManager.Domain.Diagnostics.Models;
global using VttTools.AssetImageManager.Domain.Images.Contracts;
global using VttTools.AssetImageManager.Domain.Prompts.Contracts;
global using VttTools.AssetImageManager.Domain.Prompts.Models;
global using VttTools.AssetImageManager.Domain.Storage.Contracts;
global using VttTools.AssetImageManager.Infrastructure.Storage;
global using VttTools.AssetImageManager.UnitTests.Fixtures;
global using VttTools.AssetImageManager.UnitTests.Mocks;
