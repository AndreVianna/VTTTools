using PromptTemplate = VttTools.AI.Model.PromptTemplate;

namespace VttTools.Data.AI;

public class PromptTemplateStorage(ApplicationDbContext context)
    : IPromptTemplateStorage {

    public async Task<PromptTemplate?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.PromptTemplates
            .AsNoTracking()
            .Include(t => t.ReferenceImage)
            .FirstOrDefaultAsync(t => t.Id == id, ct);
        return entity?.ToModel();
    }

    public async Task<PromptTemplate?> GetLatestByNameAsync(string name, bool includeDrafts = false, CancellationToken ct = default) {
        var query = context.PromptTemplates
            .AsNoTracking()
            .Include(t => t.ReferenceImage)
            .Where(t => t.Name == name);

        if (!includeDrafts)
            query = query.Where(t => !t.Version.EndsWith("-draft"));

        var entity = await query
                          .OrderByDescending(t => t.Version)
                          .FirstOrDefaultAsync(ct);
        return entity?.ToModel();
    }

    public async Task<(IReadOnlyList<PromptTemplate> Items, int TotalCount)> SearchAsync(PromptTemplateSearchFilters filters, CancellationToken ct = default) {
        IQueryable<Entities.PromptTemplate> query = context.PromptTemplates.AsNoTracking().Include(t => t.ReferenceImage);

        if (!string.IsNullOrWhiteSpace(filters.Name))
            query = query.Where(t => t.Name.Contains(filters.Name));

        if (filters.Category.HasValue)
            query = query.Where(t => t.Category == filters.Category.Value);

        query = filters.Scope switch {
            VersionScope.LatestOnly => query.Where(t => !t.Version.EndsWith("-draft"))
                                            .GroupBy(t => t.Name)
                                            .Select(g => g.OrderByDescending(t => t.Version).First()),
            VersionScope.LatestIncludingDrafts => query.GroupBy(t => t.Name)
                                                       .Select(g => g.OrderByDescending(t => t.Version).First()),
            VersionScope.AllVersions => query,
            _ => query,
        };

        var totalCount = await query.CountAsync(ct);

        query = query.OrderBy(t => t.Name).ThenByDescending(t => t.Version);

        if (filters.Pagination is not null) {
            query = query.Skip(filters.Pagination.Index * filters.Pagination.Size)
                         .Take(filters.Pagination.Size);
        }

        var entities = await query.ToListAsync(ct);
        return ([.. entities.Select(e => e.ToModel()!)], totalCount);
    }

    public async Task<PromptTemplate> AddAsync(PromptTemplate template, CancellationToken ct = default) {
        var entity = template.ToEntity();
        await context.PromptTemplates.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
        return template;
    }

    public async Task<PromptTemplate> UpdateAsync(PromptTemplate template, CancellationToken ct = default) {
        var existing = await context.PromptTemplates
            .FirstOrDefaultAsync(t => t.Id == template.Id, ct)
            ?? throw new InvalidOperationException($"Prompt template with ID {template.Id} not found.");

        existing.UpdateFrom(template);
        await context.SaveChangesAsync(ct);
        return template;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default) {
        var existing = await context.PromptTemplates
            .FirstOrDefaultAsync(t => t.Id == id, ct);

        if (existing is not null) {
            context.PromptTemplates.Remove(existing);
            await context.SaveChangesAsync(ct);
        }
    }

    public Task<bool> ExistsAsync(string name, string version, CancellationToken ct = default)
        => context.PromptTemplates
                  .AsNoTracking()
                  .AnyAsync(t => t.Name == name && t.Version == version, ct);
}
