global using System.Security.Claims;

global using AwesomeAssertions;

global using DotNetToolbox;
global using DotNetToolbox.Results;

global using Microsoft.AspNetCore.Builder;
global using Microsoft.AspNetCore.Http;
global using Microsoft.AspNetCore.Http.HttpResults;
global using Microsoft.AspNetCore.Routing;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.Extensions.Hosting;
global using Microsoft.Extensions.Logging.Abstractions;

global using NSubstitute;

global using VttTools.Assets.Model;
global using VttTools.Assets.Storage;
global using VttTools.Common.Model;
global using VttTools.Data;
global using VttTools.Data.Library;
global using VttTools.Extensions;
global using VttTools.Library.Adventures.ApiContracts;
global using VttTools.Library.Adventures.Model;
global using VttTools.Library.Adventures.ServiceContracts;
global using VttTools.Library.Adventures.Services;
global using VttTools.Library.Adventures.Storage;
global using VttTools.Library.Campaigns.ApiContracts;
global using VttTools.Library.Campaigns.Model;
global using VttTools.Library.Campaigns.ServiceContracts;
global using VttTools.Library.Campaigns.Services;
global using VttTools.Library.Campaigns.Storage;
global using VttTools.Library.Content.ApiContracts;
global using VttTools.Library.Content.Model;
global using VttTools.Library.Content.ServiceContracts;
global using VttTools.Library.Content.Services;
global using VttTools.Library.Epics.ApiContracts;
global using VttTools.Library.Epics.Model;
global using VttTools.Library.Epics.ServiceContracts;
global using VttTools.Library.Epics.Services;
global using VttTools.Library.Epics.Storage;
global using VttTools.Library.Scenes.ApiContracts;
global using VttTools.Library.Scenes.Model;
global using VttTools.Library.Scenes.ServiceContracts;
global using VttTools.Library.Scenes.Services;
global using VttTools.Library.Scenes.Storage;
global using VttTools.Library.Services;
global using VttTools.Media.Model;
global using VttTools.Media.Storage;
global using VttTools.Utilities;

global using Xunit;
