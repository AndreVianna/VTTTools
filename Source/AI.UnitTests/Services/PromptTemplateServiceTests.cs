
namespace VttTools.AI.Services;

public class PromptTemplateServiceTests {
    private readonly IPromptTemplateStorage _storage = Substitute.For<IPromptTemplateStorage>();
    private readonly IMediaStorage _mediaStorage = Substitute.For<IMediaStorage>();
    private readonly PromptTemplateService _service;
    private readonly CancellationToken _ct;

    public PromptTemplateServiceTests() {
        _service = new PromptTemplateService(_storage, _mediaStorage);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsTemplateFromStorage() {
        var templateId = Guid.CreateVersion7();
        var expected = CreateTemplate(templateId, "TestTemplate");
        _storage.GetByIdAsync(templateId, _ct).Returns(expected);

        var result = await _service.GetByIdAsync(templateId, _ct);

        result.Should().Be(expected);
    }

    [Fact]
    public async Task GetByIdAsync_WhenNotFound_ReturnsNull() {
        var templateId = Guid.CreateVersion7();
        _storage.GetByIdAsync(templateId, _ct).Returns((PromptTemplate?)null);

        var result = await _service.GetByIdAsync(templateId, _ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetLatestByNameAsync_ReturnsTemplateFromStorage() {
        var expected = CreateTemplate(Guid.CreateVersion7(), "TestTemplate");
        _storage.GetLatestByNameAsync("TestTemplate", false, _ct).Returns(expected);

        var result = await _service.GetLatestByNameAsync("TestTemplate", false, _ct);

        result.Should().Be(expected);
    }

    [Fact]
    public async Task GetLatestByNameAsync_WithIncludeDrafts_PassesFlagToStorage() {
        var expected = CreateTemplate(Guid.CreateVersion7(), "TestTemplate", version: "2.0-draft");
        _storage.GetLatestByNameAsync("TestTemplate", true, _ct).Returns(expected);

        var result = await _service.GetLatestByNameAsync("TestTemplate", true, _ct);

        result.Should().Be(expected);
        await _storage.Received(1).GetLatestByNameAsync("TestTemplate", true, _ct);
    }

    [Fact]
    public async Task SearchAsync_ReturnsFilteredTemplatesFromStorage() {
        var templates = new List<PromptTemplate> {
            CreateTemplate(Guid.CreateVersion7(), "Template1"),
            CreateTemplate(Guid.CreateVersion7(), "Template2"),
        };
        var filters = new PromptTemplateSearchFilters();
        _storage.SearchAsync(filters, _ct).Returns((templates, 2));

        (var items, var totalCount) = await _service.SearchAsync(filters, _ct);

        items.Should().HaveCount(2);
        totalCount.Should().Be(2);
        items.Should().BeEquivalentTo(templates);
    }

    [Fact]
    public async Task SearchAsync_WithCategoryFilter_ReturnsFilteredTemplates() {
        var templates = new List<PromptTemplate> {
            CreateTemplate(Guid.CreateVersion7(), "Portrait1", category: GeneratedContentType.ImagePortrait),
            CreateTemplate(Guid.CreateVersion7(), "Portrait2", category: GeneratedContentType.ImagePortrait),
        };
        var filters = new PromptTemplateSearchFilters { Category = GeneratedContentType.ImagePortrait };
        _storage.SearchAsync(filters, _ct).Returns((templates, 2));

        (var items, var totalCount) = await _service.SearchAsync(filters, _ct);

        items.Should().HaveCount(2);
        totalCount.Should().Be(2);
        items.Should().AllSatisfy(t => t.Category.Should().Be(GeneratedContentType.ImagePortrait));
    }

    [Fact]
    public async Task CreateAsync_WithNewNameAndVersion_CreatesTemplate() {
        var data = new CreatePromptTemplateData {
            Name = "NewTemplate",
            Category = GeneratedContentType.ImagePortrait,
            UserPromptTemplate = "Create a {subject} portrait",
        };
        _storage.ExistsAsync("NewTemplate", "1.0-draft", _ct).Returns(false);
        _storage.AddAsync(Arg.Any<PromptTemplate>(), _ct)
            .Returns(ci => ci.Arg<PromptTemplate>());

        var result = await _service.CreateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be("NewTemplate");
        result.Value.Category.Should().Be(GeneratedContentType.ImagePortrait);
        result.Value.Version.Should().Be("1.0-draft");
    }

    [Fact]
    public async Task CreateAsync_WithExplicitVersion_UsesProvidedVersion() {
        var data = new CreatePromptTemplateData {
            Name = "NewTemplate",
            Category = GeneratedContentType.ImagePortrait,
            Version = "2.0",
            UserPromptTemplate = "Create a {subject} portrait",
        };
        _storage.ExistsAsync("NewTemplate", "2.0", _ct).Returns(false);
        _storage.AddAsync(Arg.Any<PromptTemplate>(), _ct)
            .Returns(ci => ci.Arg<PromptTemplate>());

        var result = await _service.CreateAsync(data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Version.Should().Be("2.0");
    }

    [Fact]
    public async Task CreateAsync_WithExistingNameAndVersion_ReturnsFailure() {
        var data = new CreatePromptTemplateData {
            Name = "ExistingTemplate",
            Category = GeneratedContentType.ImagePortrait,
            UserPromptTemplate = "Test template",
        };
        _storage.ExistsAsync("ExistingTemplate", "1.0-draft", _ct).Returns(true);

        var result = await _service.CreateAsync(data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("ExistingTemplate");
        result.Errors[0].Message.Should().Contain("already exists");
    }

    [Fact]
    public async Task UpdateAsync_WithValidId_UpdatesTemplate() {
        var templateId = Guid.CreateVersion7();
        var existing = CreateTemplate(templateId, "Template", systemPrompt: "Old prompt");
        var data = new UpdatePromptTemplateData {
            SystemPrompt = "New prompt",
        };
        _storage.GetByIdAsync(templateId, _ct).Returns(existing);
        _storage.UpdateAsync(Arg.Any<PromptTemplate>(), _ct)
            .Returns(ci => ci.Arg<PromptTemplate>());

        var result = await _service.UpdateAsync(templateId, data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.SystemPrompt.Should().Be("New prompt");
    }

    [Fact]
    public async Task UpdateAsync_WithInvalidId_ReturnsFailure() {
        var templateId = Guid.CreateVersion7();
        var data = new UpdatePromptTemplateData {
            SystemPrompt = "New prompt",
        };
        _storage.GetByIdAsync(templateId, _ct).Returns((PromptTemplate?)null);

        var result = await _service.UpdateAsync(templateId, data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain(templateId.ToString());
    }

    [Fact]
    public async Task UpdateAsync_PartialUpdate_PreservesUnchangedFields() {
        var templateId = Guid.CreateVersion7();
        var existing = CreateTemplate(templateId, "Template",
            systemPrompt: "Original system",
            userPrompt: "Original user");
        var data = new UpdatePromptTemplateData {
            SystemPrompt = "New system",
        };
        _storage.GetByIdAsync(templateId, _ct).Returns(existing);
        _storage.UpdateAsync(Arg.Any<PromptTemplate>(), _ct)
            .Returns(ci => ci.Arg<PromptTemplate>());

        var result = await _service.UpdateAsync(templateId, data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.SystemPrompt.Should().Be("New system");
        result.Value.UserPromptTemplate.Should().Be("Original user");
    }

    [Fact]
    public async Task UpdateAsync_WithVersionChange_ChecksForDuplicate() {
        var templateId = Guid.CreateVersion7();
        var existing = CreateTemplate(templateId, "Template", version: "1.0");
        var data = new UpdatePromptTemplateData {
            Version = "2.0",
        };
        _storage.GetByIdAsync(templateId, _ct).Returns(existing);
        _storage.ExistsAsync("Template", "2.0", _ct).Returns(true);

        var result = await _service.UpdateAsync(templateId, data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("already exists");
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_DeletesTemplate() {
        var templateId = Guid.CreateVersion7();
        var existing = CreateTemplate(templateId, "Template");
        _storage.GetByIdAsync(templateId, _ct).Returns(existing);

        var result = await _service.DeleteAsync(templateId, _ct);

        result.IsSuccessful.Should().BeTrue();
        await _storage.Received(1).DeleteAsync(templateId, _ct);
    }

    [Fact]
    public async Task DeleteAsync_WithInvalidId_ReturnsFailure() {
        var templateId = Guid.CreateVersion7();
        _storage.GetByIdAsync(templateId, _ct).Returns((PromptTemplate?)null);

        var result = await _service.DeleteAsync(templateId, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain(templateId.ToString());
    }

    [Fact]
    public void ResolveTemplate_WithSimpleVariable_ReplacesCorrectly() {
        const string template = "{name}";
        var context = new Dictionary<string, string> { ["name"] = "Dragon" };

        var result = _service.ResolveTemplate(template, context);

        result.Should().Be("Dragon");
    }

    [Fact]
    public void ResolveTemplate_WithMultipleVariables_ReplacesAll() {
        const string template = "A {adjective} {creature}";
        var context = new Dictionary<string, string> {
            ["adjective"] = "fierce",
            ["creature"] = "dragon",
        };

        var result = _service.ResolveTemplate(template, context);

        result.Should().Be("A fierce dragon");
    }

    [Fact]
    public void ResolveTemplate_WithDefaultValue_UsesDefaultWhenEmpty() {
        const string template = "{missing:default}";
        var context = new Dictionary<string, string> { ["missing"] = "" };

        var result = _service.ResolveTemplate(template, context);

        result.Should().Be("default");
    }

    [Fact]
    public void ResolveTemplate_WithDefaultValue_UsesProvidedValueWhenPresent() {
        const string template = "{var:fallback}";
        var context = new Dictionary<string, string> { ["var"] = "value" };

        var result = _service.ResolveTemplate(template, context);

        result.Should().Be("value");
    }

    [Fact]
    public void ResolveTemplate_WithEmptyTemplate_ReturnsEmpty() {
        var result = _service.ResolveTemplate("", new Dictionary<string, string>());

        result.Should().BeEmpty();
    }

    [Fact]
    public void ResolveTemplate_WithNullTemplate_ReturnsNull() {
        var result = _service.ResolveTemplate(null!, new Dictionary<string, string>());

        result.Should().BeNull();
    }

    [Fact]
    public void ResolveTemplate_WithNoVariables_ReturnsOriginal() {
        const string template = "A static template with no variables";

        var result = _service.ResolveTemplate(template, new Dictionary<string, string>());

        result.Should().Be(template);
    }

    [Fact]
    public void ResolveTemplate_WithMissingVariableAndNoDefault_KeepsPlaceholder() {
        const string template = "Hello {unknown}";

        var result = _service.ResolveTemplate(template, new Dictionary<string, string>());

        result.Should().Be("Hello {unknown}");
    }

    private static PromptTemplate CreateTemplate(
        Guid id,
        string name,
        GeneratedContentType category = GeneratedContentType.ImagePortrait,
        string version = "1.0",
        string systemPrompt = "",
        string userPrompt = "Default template") => new() {
            Id = id,
            Name = name,
            Category = category,
            Version = version,
            SystemPrompt = systemPrompt,
            UserPromptTemplate = userPrompt,
        };
}
