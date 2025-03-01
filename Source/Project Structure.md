# VTTTools Solution

This document outlines the hierarchical structure of the VTTTools project, presenting the organization of files and folders. Each main directory and subdirectory is represented for clarity.

- **VttTools.sln**

## AppHost Project
- **AppHost.csproj**
- **appsettings.Development.json**
- **appsettings.json**
- **Program.cs**
- **Properties**
  - **launchSettings.json**

## Domain Project
- **Domain.csproj**
- **GlobalUsings.cs**
- **Contracts**
  - **Account**
    - **FindUserResponse.cs**
    - **RegisterUserRequest.cs**
    - **RegisterUserResponse.cs**
  - **Chat**
    - **IChatService.cs**
  - **GameSession**
    - **IGameSessionService.cs**
  - **GameToken**
    - **ITokenService.cs**
  - **Media**
    - **IStorageService.cs**
  - **SignIn**
    - **PasswordSignInRequest.cs**
    - **SignInResponse.cs**
- **Helpers**
  - **StringHelpers.cs**
- **Model**
  - **ChatMessage.cs**
  - **DiceRoll.cs**
  - **GameSession.cs**
  - **GameToken.cs**
  - **Map.cs**
  - **Player.cs**
  - **PlayerRole.cs**
  - **Position.cs**
  - **Size.cs**
  - **User.cs**
- **Storage**
  - **IGameSessionStorage.cs**
- **Views**
  - **DashboardView.cs**

## GameService Project
- **appsettings.Development.json**
- **appsettings.json**
- **GameService.csproj**
- **GlobalUsings.cs**
- **HostApplicationBuilderExtensions.cs**
- **Program.cs**
- **WebApplicationExtensions.cs**
- **Data**
  - **GameServiceDbContext.cs**
- **Properties**
  - **launchSettings.json**
- **Services**
  - **GameSessionService.cs**

## HttpServices Project
- **GlobalUsings.cs**
- **HostApplicationBuilderExtensions.cs**
- **HttpServices.csproj**
- **IdentityProviderWebApi.cs**
- **WebApi.cs**
- **WebApiBuilder.cs**
- **Data**
  - **ApiDbContext.cs**
  - **DateTimeOffsetValueGenerator.cs**
  - **DateTimeValueGenerator.cs**
  - **EntityTypeBuilderExtensions.cs**
  - **IdentityApiDbContext.cs**
  - **PersonalDataConverter.cs**
  - **PropertyBuilderExtensions.cs**
  - **Version7GuidBase64StringValueGenerator.cs**
  - **Version7GuidValueGenerator.cs**
- **Endpoints**
  - **ApiClientEndpoints.cs**
  - **AuthenticationEndpoints.cs**
  - **HealthCheckEndpoints.cs**
  - **UserAccountEndpoints.cs**
- **Properties**
  - **launchSettings.json**
- **Services**
  - **Account**
    - **AccountService.cs**
    - **IAccountService.cs**
  - **Authentication**
    - **AuthenticationService.cs**
    - **IAuthenticationService.cs**
  - **Cache**
    - **CacheService.cs**
    - **ICacheService.cs**
  - **Client**
    - **ClientService.cs**
    - **IClientService.cs**
  - **Messaging**
    - **IMessagingService.cs**
    - **MessagingService.cs**
  - **Token**
    - **ITokenService.cs**
    - **TokenService.cs**

## HttpServices.Abstractions Project
- **GlobalUsings.cs**
- **HttpServices.Abstractions.csproj**
- **Contracts**
  - **Account**
    - **FindUserResponse.cs**
    - **RegisterUserRequest.cs**
    - **RegisterUserResponse.cs**
  - **Client**
    - **RegisterClientRequest.cs**
    - **RegisterClientResponse.cs**
  - **SignIn**
    - **PasswordSignInRequest.cs**
    - **SignInResponse.cs**
- **Helpers**
  - **StringHelpers.cs**
- **Model**
  - **Consumer.cs**
  - **JwtSettings.cs**
  - **Role.cs**
  - **RoleClaim.cs**
  - **TwoFactorType.cs**
  - **User.cs**
  - **UserClaim.cs**
  - **UserLogin.cs**
  - **UserRole.cs**
  - **UserToken.cs**

## IdentityService Project
- **appsettings.Development.json**
- **appsettings.json**
- **GlobalUsings.cs**
- **HostApplicationBuilderExtensions.cs**
- **IdentityService.csproj**
- **Program.cs**
- **Data**
  - **IdentityServiceDbContext.cs**
- **Properties**
  - **launchSettings.json**
- **Services**
  - **IdentityNoOpEmailSender.cs**
  - **IEmailSender.cs**
  - **NoOpEmailSender.cs**

## Tests Project
- **Tests.csproj**
- **WebTests.cs**

## WebApp Project
- **appsettings.Development.json**
- **appsettings.json**
- **GlobalUsings.cs**
- **Program.cs**
- **WebApp.csproj**
- **_Imports.razor**
- **Components**
  - **App.razor**
  - **NavMenu.razor**
  - **NavMenu.razor.cs**
  - **Routes.razor**
  - **_Imports.razor**
  - **Account**
    - **IdentityComponentsEndpointRouteBuilderExtensions.cs**
    - **IdentityRedirectManager.cs**
    - **IdentityRevalidatingAuthenticationStateProvider.cs**
    - **IdentityUserAccessor.cs**
    - **Model**
      - **User.cs**
    - **Pages**
      - **AccessDenied.razor**
      - **ConfirmEmail.razor**
      - **ConfirmEmail.razor.cs**
      - **ConfirmEmailChange.razor**
      - **ConfirmEmailChange.razor.cs**
      - **ExternalLogin.razor**
      - **ExternalLogin.razor.cs**
      - **ForgotPassword.razor**
      - **ForgotPassword.razor.cs**
      - **ForgotPasswordConfirmation.razor**
      - **InvalidPasswordReset.razor**
      - **InvalidUser.razor**
      - **Lockout.razor**
      - **Login.razor**
      - **Login.razor.cs**
      - **LoginWith2fa.razor**
      - **LoginWith2fa.razor.cs**
      - **LoginWithRecoveryCode.razor**
      - **LoginWithRecoveryCode.razor.cs**
      - **Register.razor**
      - **Register.razor.cs**
      - **RegisterConfirmation.razor**
      - **RegisterConfirmation.razor.cs**
      - **ResendEmailConfirmation.razor**
      - **ResendEmailConfirmation.razor.cs**
      - **ResetPassword.razor**
      - **ResetPassword.razor.cs**
      - **ResetPasswordConfirmation.razor**
      - **_Imports.razor**
      - **Manage**
        - **ChangePassword.razor**
        - **ChangePassword.razor.cs**
        - **DeletePersonalData.razor**
        - **DeletePersonalData.razor.cs**
        - **Disable2fa.razor**
        - **Disable2fa.razor.cs**
        - **Email.razor**
        - **Email.razor.cs**
        - **EnableAuthenticator.razor**
        - **EnableAuthenticator.razor.cs**
        - **ExternalLogins.razor**
        - **ExternalLogins.razor.cs**
        - **GenerateRecoveryCodes.razor**
        - **GenerateRecoveryCodes.razor.cs**
        - **Index.razor**
        - **Index.razor.cs**
        - **PersonalData.razor**
        - **PersonalData.razor.cs**
        - **ResetAuthenticator.razor**
        - **ResetAuthenticator.razor.cs**
        - **SetPassword.razor**
        - **SetPassword.razor.cs**
        - **TwoFactorAuthentication.razor**
        - **TwoFactorAuthentication.razor.cs**
        - **_Imports.razor**
    - **Shared**
      - **ExternalLoginPicker.razor**
      - **ExternalLoginPicker.razor.cs**
      - **ManageLayout.razor**
      - **ManageNavMenu.razor**
      - **ManageNavMenu.razor.cs**
      - **ShowRecoveryCodes.razor**
      - **ShowRecoveryCodes.razor.cs**
      - **StatusMessage.razor**
      - **StatusMessage.razor.cs**
- **Layouts**
  - **MainLayout.razor**
  - **_Imports.razor**
- **Pages**
  - **Chat.razor**
  - **Chat.razor.cs**
  - **Error.razor**
  - **Error.razor.cs**
  - **Index.razor**
  - **Sessions.razor**
  - **Sessions.razor.cs**
  - **_Imports.razor**
- **Properties**
  - **launchSettings.json**
  - **serviceDependencies.json**
  - **serviceDependencies.local.json**

