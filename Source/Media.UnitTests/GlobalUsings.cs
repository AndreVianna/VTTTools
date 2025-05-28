global using System.Collections.Generic;
global using System.Globalization;

global using Azure;
global using Azure.Storage.Blobs;
global using Azure.Storage.Blobs.Models;

global using FluentAssertions;

global using Microsoft.AspNetCore.Builder;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.Extensions.DependencyInjection;
global using Microsoft.Extensions.Hosting;
global using Microsoft.Extensions.Logging.Abstractions;

global using NSubstitute;

global using VttTools.Assets.Model;
global using VttTools.Common.Model;
global using VttTools.Extensions;
global using VttTools.Game.Sessions.Model;
global using VttTools.Game.Sessions.Storage;
global using VttTools.Library.Adventures.Model;
global using VttTools.Library.Adventures.Storage;
global using VttTools.Library.Scenes.Model;
global using VttTools.Library.Scenes.Storage;
global using VttTools.Media.Model;