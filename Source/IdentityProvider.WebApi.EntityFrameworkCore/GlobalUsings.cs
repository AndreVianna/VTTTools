global using System.ComponentModel.DataAnnotations;
global using System.Security.Claims;

global using Microsoft.AspNetCore.Builder;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.EntityFrameworkCore.Infrastructure;
global using Microsoft.Extensions.DependencyInjection;
global using Microsoft.Extensions.Options;

global using WebApi;
global using WebApi.Builders;
global using WebApi.EntityFrameworkCore.Utilities;
global using WebApi.DataStores;
global using WebApi.Identity.EntityFrameworkCore;
global using WebApi.Identity.EntityFrameworkCore.Builders;
global using WebApi.Identity.EntityFrameworkCore.DataStores;
global using WebApi.Identity.EntityFrameworkCore.Entities;
global using WebApi.Model;
global using WebApi.Options;

global using LoginProviderEntity = WebApi.Identity.EntityFrameworkCore.Entities.LoginProvider;
global using Role = WebApi.Model.Role;
global using RoleEntity = WebApi.Identity.EntityFrameworkCore.Entities.Role;
global using User = WebApi.Model.User;
global using UserEntity = WebApi.Identity.EntityFrameworkCore.Entities.User;
