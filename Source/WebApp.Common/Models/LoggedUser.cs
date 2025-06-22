namespace VttTools.WebApp.Common.Models;

public record LoggedUser(Guid Id, string DisplayName, bool IsAdministrator);