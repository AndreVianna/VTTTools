namespace VttTools.Admin.EndpointMappers;

public static class AssetAdminEndpointsMapper {
    public static void MapAssetEndpoints(this RouteGroupBuilder libraryGroup) {
        var assetsGroup = libraryGroup.MapGroup("/assets");

        assetsGroup.MapGet("/", AssetAdminHandlers.SearchHandler)
            .WithName("SearchAssets")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        assetsGroup.MapGet("/{id:guid}", AssetAdminHandlers.GetByIdHandler)
            .WithName("GetAssetById")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        assetsGroup.MapPost("/", AssetAdminHandlers.CreateHandler)
            .WithName("CreateAsset")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        assetsGroup.MapPatch("/{id:guid}", AssetAdminHandlers.UpdateHandler)
            .WithName("UpdateAsset")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        assetsGroup.MapDelete("/{id:guid}", AssetAdminHandlers.DeleteHandler)
            .WithName("DeleteAsset")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        assetsGroup.MapPost("/{id:guid}/transfer", AssetAdminHandlers.TransferOwnershipHandler)
            .WithName("TransferAssetOwnership")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        assetsGroup.MapGet("/taxonomy", AssetAdminHandlers.GetTaxonomyHandler)
            .WithName("GetAssetTaxonomy")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));
    }
}