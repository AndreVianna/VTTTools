using Source = VttTools.Library.Scenes.Model.Source;

namespace VttTools.Library.UnitTests.Services;

public class SourceServiceTests {
    private readonly Guid _ownerId = Guid.NewGuid();
    private readonly ISourceStorage _storage;
    private readonly SourceService _service;
    private readonly CancellationToken _ct;

    public SourceServiceTests() {
        _storage = Substitute.For<ISourceStorage>();
        _service = new SourceService(_storage);
#if XUNITV3
        _ct = TestContext.Current.CancellationToken;
#else
        _ct = CancellationToken.None;
#endif
    }

    [Fact]
    public async Task CreateSourceAsync_WithValidData_ReturnsSuccess() {
        var data = new CreateSourceData {
            Name = "Torch Light",
            Description = "A flickering torch",
            SourceType = "Light",
            DefaultRange = 10.5m,
            DefaultIntensity = 0.8m,
            DefaultIsGradient = true,
        };

        var result = await _service.CreateSourceAsync(data, _ownerId);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Name.Should().Be("Torch Light");
        result.Value.SourceType.Should().Be("Light");
        result.Value.DefaultRange.Should().Be(10.5m);
        result.Value.DefaultIntensity.Should().Be(0.8m);
        result.Value.OwnerId.Should().Be(_ownerId);
        await _storage.Received(1).AddAsync(Arg.Any<Source>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateSourceAsync_WithEmptyName_ReturnsValidationError() {
        var data = new CreateSourceData {
            Name = "",
            SourceType = "Light",
            DefaultRange = 5.0m,
            DefaultIntensity = 1.0m,
        };

        var result = await _service.CreateSourceAsync(data, _ownerId);

        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle();
        result.Errors[0].Message.Should().Contain("name is required");
        await _storage.DidNotReceive().AddAsync(Arg.Any<Source>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateSourceAsync_WithEmptySourceType_ReturnsValidationError() {
        var data = new CreateSourceData {
            Name = "Test Source",
            SourceType = "",
            DefaultRange = 5.0m,
            DefaultIntensity = 1.0m,
        };

        var result = await _service.CreateSourceAsync(data, _ownerId);

        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle();
        result.Errors[0].Message.Should().Contain("type is required");
        await _storage.DidNotReceive().AddAsync(Arg.Any<Source>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateSourceAsync_WithZeroRange_ReturnsValidationError() {
        var data = new CreateSourceData {
            Name = "Test Source",
            SourceType = "Light",
            DefaultRange = 0m,
            DefaultIntensity = 1.0m,
        };

        var result = await _service.CreateSourceAsync(data, _ownerId);

        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle();
        result.Errors[0].Message.Should().Contain("range must be greater than 0");
        await _storage.DidNotReceive().AddAsync(Arg.Any<Source>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateSourceAsync_WithNegativeRange_ReturnsValidationError() {
        var data = new CreateSourceData {
            Name = "Test Source",
            SourceType = "Light",
            DefaultRange = -5.0m,
            DefaultIntensity = 1.0m,
        };

        var result = await _service.CreateSourceAsync(data, _ownerId);

        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle();
        result.Errors[0].Message.Should().Contain("range must be greater than 0");
        await _storage.DidNotReceive().AddAsync(Arg.Any<Source>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateSourceAsync_WithExcessiveRange_ReturnsValidationError() {
        var data = new CreateSourceData {
            Name = "Test Source",
            SourceType = "Light",
            DefaultRange = 100.0m,
            DefaultIntensity = 1.0m,
        };

        var result = await _service.CreateSourceAsync(data, _ownerId);

        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle();
        result.Errors[0].Message.Should().Contain("range must not exceed 99.99");
        await _storage.DidNotReceive().AddAsync(Arg.Any<Source>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateSourceAsync_WithNegativeIntensity_ReturnsValidationError() {
        var data = new CreateSourceData {
            Name = "Test Source",
            SourceType = "Light",
            DefaultRange = 5.0m,
            DefaultIntensity = -0.5m,
        };

        var result = await _service.CreateSourceAsync(data, _ownerId);

        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle();
        result.Errors[0].Message.Should().Contain("intensity must be between 0.0 and 1.0");
        await _storage.DidNotReceive().AddAsync(Arg.Any<Source>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateSourceAsync_WithExcessiveIntensity_ReturnsValidationError() {
        var data = new CreateSourceData {
            Name = "Test Source",
            SourceType = "Light",
            DefaultRange = 5.0m,
            DefaultIntensity = 1.5m,
        };

        var result = await _service.CreateSourceAsync(data, _ownerId);

        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle();
        result.Errors[0].Message.Should().Contain("intensity must be between 0.0 and 1.0");
        await _storage.DidNotReceive().AddAsync(Arg.Any<Source>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetSourcesAsync_ReturnsOnlyOwnedSources() {
        var sources = new List<Source> {
            new() { Id = Guid.NewGuid(), OwnerId = _ownerId, Name = "Source 1", SourceType = "Light" },
            new() { Id = Guid.NewGuid(), OwnerId = _ownerId, Name = "Source 2", SourceType = "Sound" },
        };
        _storage.GetByOwnerAsync(_ownerId, 1, 10, Arg.Any<CancellationToken>()).Returns(sources);

        var result = await _service.GetSourcesAsync(_ownerId, 1, 10);

        result.Should().HaveCount(2);
        result.Should().OnlyContain(s => s.OwnerId == _ownerId);
    }

    [Fact]
    public async Task GetSourceByIdAsync_WithValidId_ReturnsSource() {
        var sourceId = Guid.NewGuid();
        var source = new Source {
            Id = sourceId,
            OwnerId = _ownerId,
            Name = "Test Source",
            SourceType = "Light",
        };
        _storage.GetByIdAsync(sourceId, Arg.Any<CancellationToken>()).Returns(source);

        var result = await _service.GetSourceByIdAsync(sourceId, _ownerId);

        result.Should().NotBeNull();
        result!.Id.Should().Be(sourceId);
        result.OwnerId.Should().Be(_ownerId);
    }

    [Fact]
    public async Task GetSourceByIdAsync_WithDifferentOwner_ReturnsNull() {
        var sourceId = Guid.NewGuid();
        var differentOwnerId = Guid.NewGuid();
        var source = new Source {
            Id = sourceId,
            OwnerId = differentOwnerId,
            Name = "Test Source",
            SourceType = "Light",
        };
        _storage.GetByIdAsync(sourceId, Arg.Any<CancellationToken>()).Returns(source);

        var result = await _service.GetSourceByIdAsync(sourceId, _ownerId);

        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateSourceAsync_WithNonExistentId_ReturnsNotFound() {
        var sourceId = Guid.NewGuid();
        var data = new UpdateSourceData {
            Name = "Updated Source",
            SourceType = "Light",
            DefaultRange = 5.0m,
            DefaultIntensity = 1.0m,
        };
        _storage.GetByIdAsync(sourceId, Arg.Any<CancellationToken>()).Returns((Source?)null);

        var result = await _service.UpdateSourceAsync(sourceId, data, _ownerId);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotFound");
        await _storage.DidNotReceive().UpdateAsync(Arg.Any<Source>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateSourceAsync_WithDifferentOwner_ReturnsNotAllowed() {
        var sourceId = Guid.NewGuid();
        var differentOwnerId = Guid.NewGuid();
        var source = new Source {
            Id = sourceId,
            OwnerId = differentOwnerId,
            Name = "Test Source",
            SourceType = "Light",
        };
        var data = new UpdateSourceData {
            Name = "Updated Source",
            SourceType = "Light",
            DefaultRange = 5.0m,
            DefaultIntensity = 1.0m,
        };
        _storage.GetByIdAsync(sourceId, Arg.Any<CancellationToken>()).Returns(source);

        var result = await _service.UpdateSourceAsync(sourceId, data, _ownerId);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotAllowed");
        await _storage.DidNotReceive().UpdateAsync(Arg.Any<Source>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateSourceAsync_WithValidData_ReturnsSuccess() {
        var sourceId = Guid.NewGuid();
        var source = new Source {
            Id = sourceId,
            OwnerId = _ownerId,
            Name = "Old Name",
            SourceType = "Light",
            DefaultRange = 5.0m,
            DefaultIntensity = 1.0m,
        };
        var data = new UpdateSourceData {
            Name = "New Name",
            SourceType = "Sound",
            DefaultRange = 15.0m,
            DefaultIntensity = 0.5m,
            DefaultIsGradient = false,
        };
        _storage.GetByIdAsync(sourceId, Arg.Any<CancellationToken>()).Returns(source);

        var result = await _service.UpdateSourceAsync(sourceId, data, _ownerId);

        result.IsSuccessful.Should().BeTrue();
        result.Value!.Name.Should().Be("New Name");
        result.Value.SourceType.Should().Be("Sound");
        result.Value.DefaultRange.Should().Be(15.0m);
        result.Value.DefaultIntensity.Should().Be(0.5m);
        result.Value.DefaultIsGradient.Should().BeFalse();
        await _storage.Received(1).UpdateAsync(Arg.Any<Source>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteSourceAsync_WithValidId_ReturnsSuccess() {
        var sourceId = Guid.NewGuid();
        var source = new Source {
            Id = sourceId,
            OwnerId = _ownerId,
            Name = "Test Source",
            SourceType = "Light",
        };
        _storage.GetByIdAsync(sourceId, Arg.Any<CancellationToken>()).Returns(source);

        var result = await _service.DeleteSourceAsync(sourceId, _ownerId);

        result.IsSuccessful.Should().BeTrue();
        await _storage.Received(1).DeleteAsync(sourceId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteSourceAsync_WithNonExistentId_ReturnsNotFound() {
        var sourceId = Guid.NewGuid();
        _storage.GetByIdAsync(sourceId, Arg.Any<CancellationToken>()).Returns((Source?)null);

        var result = await _service.DeleteSourceAsync(sourceId, _ownerId);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotFound");
        await _storage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteSourceAsync_WithDifferentOwner_ReturnsNotAllowed() {
        var sourceId = Guid.NewGuid();
        var differentOwnerId = Guid.NewGuid();
        var source = new Source {
            Id = sourceId,
            OwnerId = differentOwnerId,
            Name = "Test Source",
            SourceType = "Light",
        };
        _storage.GetByIdAsync(sourceId, Arg.Any<CancellationToken>()).Returns(source);

        var result = await _service.DeleteSourceAsync(sourceId, _ownerId);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotAllowed");
        await _storage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }
}
