using PromptTemplateModel = VttTools.AI.Model.PromptTemplate;

namespace VttTools.Data.AI;

public class PromptTemplateStorageTests
    : IDisposable {
    private readonly PromptTemplateStorage _storage;
    private readonly ApplicationDbContext _context;
    private readonly CancellationToken _ct;

    public PromptTemplateStorageTests() {
        _context = DbContextHelper.CreateInMemoryContext(Guid.CreateVersion7());
        _storage = new(_context);
        _ct = TestContext.Current.CancellationToken;
        SeedPromptTemplates();
    }

    public void Dispose() {
        DbContextHelper.Dispose(_context);
        GC.SuppressFinalize(this);
    }

    private void SeedPromptTemplates() {
        var referenceImage = new Media.Entities.Resource {
            Id = Guid.CreateVersion7(),
            ResourceType = ResourceType.Background,
            Path = "test/reference",
            FileName = "reference.png",
            ContentType = "image/png",
            FileLength = 1000,
            Size = new(100, 100),
            Duration = TimeSpan.Zero,
        };
        _context.Resources.Add(referenceImage);

        var templates = new[] {
            new Entities.PromptTemplate {
                Id = Guid.CreateVersion7(),
                Name = "Character Portrait",
                Category = GeneratedContentType.ImagePortrait,
                Version = "1.0",
                SystemPrompt = "You are a character portrait generator",
                UserPromptTemplate = "Create a portrait of {character}",
                NegativePromptTemplate = "low quality",
                ReferenceImageId = referenceImage.Id,
            },
            new Entities.PromptTemplate {
                Id = Guid.CreateVersion7(),
                Name = "Character Portrait",
                Category = GeneratedContentType.ImagePortrait,
                Version = "1.1",
                SystemPrompt = "You are an improved character portrait generator",
                UserPromptTemplate = "Create a detailed portrait of {character}",
                NegativePromptTemplate = "low quality, blurry",
            },
            new Entities.PromptTemplate {
                Id = Guid.CreateVersion7(),
                Name = "Character Portrait",
                Category = GeneratedContentType.ImagePortrait,
                Version = "2.0-draft",
                SystemPrompt = "Draft version",
                UserPromptTemplate = "Draft template",
            },
            new Entities.PromptTemplate {
                Id = Guid.CreateVersion7(),
                Name = "Scene Background",
                Category = GeneratedContentType.ImageBackground,
                Version = "1.0",
                SystemPrompt = "You are a scene background generator",
                UserPromptTemplate = "Create a background for {scene}",
            },
        };
        _context.PromptTemplates.AddRange(templates);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsTemplate() {
        var entity = await _context.PromptTemplates.FirstAsync(_ct);

        var result = await _storage.GetByIdAsync(entity.Id, _ct);

        result.Should().NotBeNull();
        result.Id.Should().Be(entity.Id);
        result.Name.Should().Be(entity.Name);
        result.Category.Should().Be(entity.Category);
        result.Version.Should().Be(entity.Version);
        result.SystemPrompt.Should().Be(entity.SystemPrompt);
        result.UserPromptTemplate.Should().Be(entity.UserPromptTemplate);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingId_ReturnsNull() {
        var nonExistingId = Guid.CreateVersion7();

        var result = await _storage.GetByIdAsync(nonExistingId, _ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetLatestByNameAsync_WithoutDrafts_ReturnsLatestPublishedVersion() {
        var result = await _storage.GetLatestByNameAsync("Character Portrait", includeDrafts: false, _ct);

        result.Should().NotBeNull();
        result.Name.Should().Be("Character Portrait");
        result.Version.Should().Be("1.1");
    }

    [Fact]
    public async Task GetLatestByNameAsync_WithDrafts_ReturnsLatestVersion() {
        var result = await _storage.GetLatestByNameAsync("Character Portrait", includeDrafts: true, _ct);

        result.Should().NotBeNull();
        result.Name.Should().Be("Character Portrait");
        result.Version.Should().Be("2.0-draft");
    }

    [Fact]
    public async Task GetLatestByNameAsync_WithNonExistingName_ReturnsNull() {
        var result = await _storage.GetLatestByNameAsync("NonExisting", includeDrafts: false, _ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task SearchAsync_WithNoFilters_ReturnsAllTemplates() {
        var filters = new PromptTemplateSearchFilters { Scope = VersionScope.AllVersions };

        var (items, totalCount) = await _storage.SearchAsync(filters, _ct);

        totalCount.Should().Be(4);
        items.Should().HaveCount(4);
    }

    [Fact]
    public async Task SearchAsync_WithNameFilter_ReturnsMatchingTemplates() {
        var filters = new PromptTemplateSearchFilters {
            Name = "Character",
            Scope = VersionScope.AllVersions,
        };

        var (items, totalCount) = await _storage.SearchAsync(filters, _ct);

        totalCount.Should().Be(3);
        items.Should().OnlyContain(t => t.Name.Contains("Character"));
    }

    [Fact]
    public async Task SearchAsync_WithCategoryFilter_ReturnsMatchingTemplates() {
        var filters = new PromptTemplateSearchFilters {
            Category = GeneratedContentType.ImageBackground,
            Scope = VersionScope.AllVersions,
        };

        var (items, totalCount) = await _storage.SearchAsync(filters, _ct);

        totalCount.Should().Be(1);
        items.Should().OnlyContain(t => t.Category == GeneratedContentType.ImageBackground);
    }

    [Fact]
    public async Task SearchAsync_WithLatestOnlyScope_ReturnsLatestVersionsExcludingDrafts() {
        var filters = new PromptTemplateSearchFilters {
            Scope = VersionScope.LatestOnly,
        };

        var (items, totalCount) = await _storage.SearchAsync(filters, _ct);

        totalCount.Should().Be(2);
        items.Should().NotContain(t => t.Version.EndsWith("-draft"));
        items.Should().Contain(t => t.Name == "Character Portrait" && t.Version == "1.1");
        items.Should().Contain(t => t.Name == "Scene Background" && t.Version == "1.0");
    }

    [Fact]
    public async Task SearchAsync_WithLatestIncludingDraftsScope_ReturnsLatestVersions() {
        var filters = new PromptTemplateSearchFilters {
            Scope = VersionScope.LatestIncludingDrafts,
        };

        var (items, totalCount) = await _storage.SearchAsync(filters, _ct);

        totalCount.Should().Be(2);
        items.Should().Contain(t => t.Name == "Character Portrait" && t.Version == "2.0-draft");
        items.Should().Contain(t => t.Name == "Scene Background" && t.Version == "1.0");
    }

    [Fact]
    public async Task SearchAsync_WithPagination_ReturnsPagedResults() {
        var filters = new PromptTemplateSearchFilters {
            Scope = VersionScope.AllVersions,
            Pagination = new Pagination { Index = 1, Size = 2 },
        };

        var (items, totalCount) = await _storage.SearchAsync(filters, _ct);

        totalCount.Should().Be(4);
        items.Should().HaveCount(2);
    }

    [Fact]
    public async Task SearchAsync_OrdersByNameThenVersionDescending() {
        var filters = new PromptTemplateSearchFilters {
            Scope = VersionScope.AllVersions,
        };

        var (items, _) = await _storage.SearchAsync(filters, _ct);

        var names = items.Select(t => t.Name).ToArray();
        names.Should().BeInAscendingOrder();

        var characterTemplates = items.Where(t => t.Name == "Character Portrait").ToArray();
        characterTemplates.Select(t => t.Version).Should().BeInDescendingOrder();
    }

    [Fact]
    public async Task AddAsync_WithValidTemplate_AddsToDatabase() {
        var template = new PromptTemplateModel {
            Id = Guid.CreateVersion7(),
            Name = "New Template",
            Category = GeneratedContentType.TextDescription,
            Version = "1.0",
            SystemPrompt = "System prompt",
            UserPromptTemplate = "User prompt",
            NegativePromptTemplate = "Negative prompt",
        };

        var result = await _storage.AddAsync(template, _ct);

        result.Should().NotBeNull();
        result.Id.Should().Be(template.Id);

        var dbTemplate = await _context.PromptTemplates.FindAsync([template.Id], _ct);
        dbTemplate.Should().NotBeNull();
        dbTemplate.Name.Should().Be(template.Name);
        dbTemplate.Category.Should().Be(template.Category);
    }

    [Fact]
    public async Task UpdateAsync_WithExistingTemplate_UpdatesDatabase() {
        var entity = await _context.PromptTemplates.FirstAsync(_ct);
        var template = new PromptTemplateModel {
            Id = entity.Id,
            Name = "Updated Name",
            Category = GeneratedContentType.TextDescription,
            Version = "2.0",
            SystemPrompt = "Updated system prompt",
            UserPromptTemplate = "Updated user prompt",
            NegativePromptTemplate = "Updated negative prompt",
        };

        var result = await _storage.UpdateAsync(template, _ct);

        result.Should().NotBeNull();
        result.Id.Should().Be(template.Id);

        var updated = await _context.PromptTemplates.FindAsync([entity.Id], _ct);
        updated.Should().NotBeNull();
        updated.Name.Should().Be("Updated Name");
        updated.Category.Should().Be(GeneratedContentType.TextDescription);
        updated.Version.Should().Be("2.0");
        updated.SystemPrompt.Should().Be("Updated system prompt");
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistingTemplate_ThrowsException() {
        var template = new PromptTemplateModel {
            Id = Guid.CreateVersion7(),
            Name = "NonExisting",
            Category = GeneratedContentType.ImagePortrait,
            Version = "1.0",
            SystemPrompt = "System",
            UserPromptTemplate = "User",
        };

        var act = async () => await _storage.UpdateAsync(template, _ct);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage($"Prompt template with ID {template.Id} not found.");
    }

    [Fact]
    public async Task DeleteAsync_WithExistingId_RemovesFromDatabase() {
        var entity = await _context.PromptTemplates.FirstAsync(_ct);

        await _storage.DeleteAsync(entity.Id, _ct);

        var deleted = await _context.PromptTemplates.FindAsync([entity.Id], _ct);
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistingId_DoesNotThrow() {
        var nonExistingId = Guid.CreateVersion7();

        var act = async () => await _storage.DeleteAsync(nonExistingId, _ct);

        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task ExistsAsync_WithExistingNameAndVersion_ReturnsTrue() {
        var entity = await _context.PromptTemplates.FirstAsync(_ct);

        var result = await _storage.ExistsAsync(entity.Name, entity.Version, _ct);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task ExistsAsync_WithNonExistingNameAndVersion_ReturnsFalse() {
        var result = await _storage.ExistsAsync("NonExisting", "1.0", _ct);

        result.Should().BeFalse();
    }
}
