using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.AI.Handlers;

internal static class PromptTemplateHandlers {
    internal static async Task<IResult> SearchTemplatesHandler(
        [FromServices] IPromptTemplateService service,
        [FromQuery] string? name,
        [FromQuery] GeneratedContentType? category,
        [FromQuery] VersionScope? scope,
        [FromQuery] int? pageIndex,
        [FromQuery] int? pageSize,
        CancellationToken ct = default) {
        var pagination = pageIndex.HasValue || pageSize.HasValue
            ? new Pagination(pageIndex ?? 0, pageSize ?? 50)
            : null;

        var filters = new PromptTemplateSearchFilters {
            Name = name,
            Category = category,
            Scope = scope ?? VersionScope.LatestOnly,
            Pagination = pagination,
        };

        var (items, totalCount) = await service.SearchAsync(filters, ct);

        var response = new PromptTemplateSearchResponse {
            Items = [.. items.Select(MapToResponse)],
            TotalCount = totalCount,
            HasMore = pagination is not null && (pagination.Index + 1) * pagination.Size < totalCount,
        };
        return Results.Ok(response);
    }

    internal static async Task<IResult> GetTemplateByIdHandler(
        [FromRoute] Guid id,
        [FromServices] IPromptTemplateService service,
        CancellationToken ct = default) {
        var template = await service.GetByIdAsync(id, ct);

        return template is null
            ? Results.NotFound(new { error = $"Template with ID {id} not found." })
            : Results.Ok(MapToResponse(template));
    }

    internal static async Task<IResult> GetLatestTemplateByNameHandler(
        [FromRoute] string name,
        [FromQuery] bool includeDrafts,
        [FromServices] IPromptTemplateService service,
        CancellationToken ct = default) {
        var template = await service.GetLatestByNameAsync(name, includeDrafts, ct);

        return template is null
            ? Results.NotFound(new { error = $"Template with name '{name}' not found." })
            : Results.Ok(MapToResponse(template));
    }

    internal static async Task<IResult> CreateTemplateHandler(
        [FromBody] CreatePromptTemplateRequest request,
        [FromServices] IPromptTemplateService service,
        CancellationToken ct = default) {
        var data = new CreatePromptTemplateData {
            Name = request.Name,
            Category = request.Category,
            Version = request.Version,
            SystemPrompt = request.SystemPrompt,
            UserPromptTemplate = request.UserPromptTemplate,
            NegativePromptTemplate = request.NegativePromptTemplate,
            ReferenceImageId = request.ReferenceImageId,
        };

        var result = await service.CreateAsync(data, ct);

        return !result.IsSuccessful
            ? Results.BadRequest(new { error = result.Errors[0].Message })
            : Results.Created($"/api/ai/templates/{result.Value.Id}", MapToResponse(result.Value));
    }

    internal static async Task<IResult> UpdateTemplateHandler(
        [FromRoute] Guid id,
        [FromBody] UpdatePromptTemplateRequest request,
        [FromServices] IPromptTemplateService service,
        CancellationToken ct = default) {
        var data = new UpdatePromptTemplateData {
            Version = request.Version,
            SystemPrompt = request.SystemPrompt,
            UserPromptTemplate = request.UserPromptTemplate,
            NegativePromptTemplate = request.NegativePromptTemplate,
            ReferenceImageId = request.ReferenceImageId,
        };

        var result = await service.UpdateAsync(id, data, ct);

        return !result.IsSuccessful
            ? Results.NotFound(new { error = result.Errors[0].Message })
            : Results.Ok(MapToResponse(result.Value));
    }

    internal static async Task<IResult> DeleteTemplateHandler(
        [FromRoute] Guid id,
        [FromServices] IPromptTemplateService service,
        CancellationToken ct = default) {
        var result = await service.DeleteAsync(id, ct);

        return !result.IsSuccessful
            ? Results.NotFound(new { error = result.Errors[0].Message })
            : Results.NoContent();
    }

    private static PromptTemplateResponse MapToResponse(PromptTemplate template) => new() {
        Id = template.Id,
        Name = template.Name,
        ContentType = template.Category,
        Version = template.Version,
        SystemPrompt = template.SystemPrompt,
        UserPromptTemplate = template.UserPromptTemplate,
        NegativePromptTemplate = template.NegativePromptTemplate,
        ReferenceImageId = template.ReferenceImage?.Id,
    };
}
