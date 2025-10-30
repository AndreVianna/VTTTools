using Barrier = VttTools.Library.Scenes.Model.Barrier;

namespace VttTools.Library.Services;

public class BarrierServiceTests {
    private readonly IBarrierStorage _barrierStorage;
    private readonly BarrierService _service;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public BarrierServiceTests() {
        _barrierStorage = Substitute.For<IBarrierStorage>();
        _service = new(_barrierStorage);
#if XUNITV3
        _ct = TestContext.Current.CancellationToken;
#else
        _ct = CancellationToken.None;
#endif
    }

    [Fact]
    public async Task GetBarriersAsync_ReturnsBarriersForOwner() {
        // Arrange
        var barriers = new List<Barrier> {
            new() { Id = Guid.CreateVersion7(), Name = "Test Barrier 1", OwnerId = _userId },
            new() { Id = Guid.CreateVersion7(), Name = "Test Barrier 2", OwnerId = _userId },
        };
        _barrierStorage.GetByOwnerAsync(_userId, 1, 20, Arg.Any<CancellationToken>()).Returns(barriers);

        // Act
        var result = await _service.GetBarriersAsync(_userId, 1, 20, _ct);

        // Assert
        result.Should().BeEquivalentTo(barriers);
        await _barrierStorage.Received(1).GetByOwnerAsync(_userId, 1, 20, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetBarrierByIdAsync_ReturnsBarrier_WhenOwnerMatches() {
        // Arrange
        var barrierId = Guid.CreateVersion7();
        var barrier = new Barrier { Id = barrierId, Name = "Test Barrier", OwnerId = _userId };
        _barrierStorage.GetByIdAsync(barrierId, Arg.Any<CancellationToken>()).Returns(barrier);

        // Act
        var result = await _service.GetBarrierByIdAsync(barrierId, _userId, _ct);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(barrierId);
        result.OwnerId.Should().Be(_userId);
        await _barrierStorage.Received(1).GetByIdAsync(barrierId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetBarrierByIdAsync_ReturnsNull_WhenBarrierNotFound() {
        // Arrange
        var barrierId = Guid.CreateVersion7();
        _barrierStorage.GetByIdAsync(barrierId, Arg.Any<CancellationToken>()).Returns((Barrier?)null);

        // Act
        var result = await _service.GetBarrierByIdAsync(barrierId, _userId, _ct);

        // Assert
        result.Should().BeNull();
        await _barrierStorage.Received(1).GetByIdAsync(barrierId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetBarrierByIdAsync_ReturnsNull_WhenOwnerDoesNotMatch() {
        // Arrange
        var barrierId = Guid.CreateVersion7();
        var differentUserId = Guid.CreateVersion7();
        var barrier = new Barrier { Id = barrierId, Name = "Test Barrier", OwnerId = differentUserId };
        _barrierStorage.GetByIdAsync(barrierId, Arg.Any<CancellationToken>()).Returns(barrier);

        // Act
        var result = await _service.GetBarrierByIdAsync(barrierId, _userId, _ct);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateBarrierAsync_CreatesNewBarrier() {
        // Arrange
        var data = new CreateBarrierData {
            Name = "New Barrier",
            Description = "Test barrier",
            Visibility = WallVisibility.Normal,
            IsClosed = false,
            Material = "Stone",
        };

        // Act
        var result = await _service.CreateBarrierAsync(data, _userId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value!.Name.Should().Be(data.Name);
        result.Value.Description.Should().Be(data.Description);
        result.Value.Visibility.Should().Be(data.Visibility);
        result.Value.IsClosed.Should().Be(data.IsClosed);
        result.Value.Material.Should().Be(data.Material);
        result.Value.OwnerId.Should().Be(_userId);
        result.Value.Id.Should().NotBe(Guid.Empty);
        await _barrierStorage.Received(1).AddAsync(Arg.Any<Barrier>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateBarrierAsync_ReturnsError_WhenNameIsEmpty() {
        // Arrange
        var data = new CreateBarrierData {
            Name = "",
            Description = "Test",
        };

        // Act
        var result = await _service.CreateBarrierAsync(data, _userId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().NotBeEmpty();
        await _barrierStorage.DidNotReceive().AddAsync(Arg.Any<Barrier>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateBarrierAsync_ReturnsError_WhenNameTooLong() {
        // Arrange
        var data = new CreateBarrierData {
            Name = new string('a', 129),
            Description = "Test",
        };

        // Act
        var result = await _service.CreateBarrierAsync(data, _userId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Message.Contains("128 characters"));
        await _barrierStorage.DidNotReceive().AddAsync(Arg.Any<Barrier>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateBarrierAsync_ReturnsError_WhenMaterialTooLong() {
        // Arrange
        var data = new CreateBarrierData {
            Name = "Test Barrier",
            Material = new string('a', 65),
        };

        // Act
        var result = await _service.CreateBarrierAsync(data, _userId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Message.Contains("64 characters"));
        await _barrierStorage.DidNotReceive().AddAsync(Arg.Any<Barrier>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateBarrierAsync_CreatesBarrier_WithNullMaterial() {
        // Arrange
        var data = new CreateBarrierData {
            Name = "Test Barrier",
            Material = null,
            Visibility = WallVisibility.Fence,
            IsClosed = true,
        };

        // Act
        var result = await _service.CreateBarrierAsync(data, _userId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value!.Material.Should().BeNull();
        result.Value.Visibility.Should().Be(WallVisibility.Fence);
        result.Value.IsClosed.Should().BeTrue();
        await _barrierStorage.Received(1).AddAsync(Arg.Any<Barrier>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateBarrierAsync_UpdatesBarrier() {
        // Arrange
        var barrierId = Guid.CreateVersion7();
        var existingBarrier = new Barrier {
            Id = barrierId,
            Name = "Old Name",
            OwnerId = _userId,
            Visibility = WallVisibility.Normal,
        };
        var data = new UpdateBarrierData {
            Name = "Updated Barrier",
            Description = "Updated description",
            Visibility = WallVisibility.Invisible,
            IsClosed = true,
            Material = "Wood",
        };
        _barrierStorage.GetByIdAsync(barrierId, Arg.Any<CancellationToken>()).Returns(existingBarrier);

        // Act
        var result = await _service.UpdateBarrierAsync(barrierId, data, _userId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value!.Name.Should().Be(data.Name);
        result.Value.Description.Should().Be(data.Description);
        result.Value.Visibility.Should().Be(data.Visibility);
        result.Value.IsClosed.Should().Be(data.IsClosed);
        result.Value.Material.Should().Be(data.Material);
        await _barrierStorage.Received(1).UpdateAsync(Arg.Any<Barrier>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateBarrierAsync_ReturnsNotFound_WhenBarrierDoesNotExist() {
        // Arrange
        var barrierId = Guid.CreateVersion7();
        var data = new UpdateBarrierData { Name = "Test" };
        _barrierStorage.GetByIdAsync(barrierId, Arg.Any<CancellationToken>()).Returns((Barrier?)null);

        // Act
        var result = await _service.UpdateBarrierAsync(barrierId, data, _userId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotFound");
        await _barrierStorage.DidNotReceive().UpdateAsync(Arg.Any<Barrier>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateBarrierAsync_ReturnsNotAllowed_WhenOwnerDoesNotMatch() {
        // Arrange
        var barrierId = Guid.CreateVersion7();
        var differentUserId = Guid.CreateVersion7();
        var existingBarrier = new Barrier {
            Id = barrierId,
            Name = "Test",
            OwnerId = differentUserId,
        };
        var data = new UpdateBarrierData { Name = "Updated" };
        _barrierStorage.GetByIdAsync(barrierId, Arg.Any<CancellationToken>()).Returns(existingBarrier);

        // Act
        var result = await _service.UpdateBarrierAsync(barrierId, data, _userId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotAllowed");
        await _barrierStorage.DidNotReceive().UpdateAsync(Arg.Any<Barrier>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteBarrierAsync_DeletesBarrier() {
        // Arrange
        var barrierId = Guid.CreateVersion7();
        var barrier = new Barrier {
            Id = barrierId,
            Name = "Test",
            OwnerId = _userId,
        };
        _barrierStorage.GetByIdAsync(barrierId, Arg.Any<CancellationToken>()).Returns(barrier);

        // Act
        var result = await _service.DeleteBarrierAsync(barrierId, _userId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _barrierStorage.Received(1).DeleteAsync(barrierId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteBarrierAsync_ReturnsNotFound_WhenBarrierDoesNotExist() {
        // Arrange
        var barrierId = Guid.CreateVersion7();
        _barrierStorage.GetByIdAsync(barrierId, Arg.Any<CancellationToken>()).Returns((Barrier?)null);

        // Act
        var result = await _service.DeleteBarrierAsync(barrierId, _userId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotFound");
        await _barrierStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteBarrierAsync_ReturnsNotAllowed_WhenOwnerDoesNotMatch() {
        // Arrange
        var barrierId = Guid.CreateVersion7();
        var differentUserId = Guid.CreateVersion7();
        var barrier = new Barrier {
            Id = barrierId,
            Name = "Test",
            OwnerId = differentUserId,
        };
        _barrierStorage.GetByIdAsync(barrierId, Arg.Any<CancellationToken>()).Returns(barrier);

        // Act
        var result = await _service.DeleteBarrierAsync(barrierId, _userId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotAllowed");
        await _barrierStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }
}