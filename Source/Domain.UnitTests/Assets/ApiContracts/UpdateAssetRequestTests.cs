namespace VttTools.Assets.ApiContracts;

public class UpdateAssetRequestTests {
    [Fact]
    public void WithClause_ObjectAsset_UpdatesProperties() {
        var originalPortraitId = Guid.CreateVersion7();
        var original = new UpdateAssetRequest {
            Name = "Table",
            Description = "A table",
            PortraitId = originalPortraitId,
            TopDownId = Guid.CreateVersion7(),
            Size = new NamedSize { Width = 1, Height = 1 },
            ObjectData = new ObjectData {
                IsMovable = true,
                IsOpaque = false
            }
        };
        const string newName = "Large Table";
        var newPortraitId = Guid.CreateVersion7();

        var updated = original with {
            Name = newName,
            PortraitId = newPortraitId,
            MiniatureId = Guid.CreateVersion7(),
            Size = new NamedSize { Width = 2, Height = 2 },
            ObjectData = new ObjectData {
                IsMovable = false,
                IsOpaque = false
            }
        };

        updated.Name.Value.Should().Be(newName);
        updated.PortraitId.Value.Should().Be(newPortraitId);
        updated.MiniatureId.IsSet.Should().BeTrue();
        updated.Size.Value.Width.Should().Be(2);
        updated.Size.Value.Height.Should().Be(2);
        updated.ObjectData.Value.IsMovable.Should().BeFalse();
    }

    [Fact]
    public void WithClause_CreatureAsset_UpdatesProperties() {
        // Arrange
        var original = new UpdateAssetRequest {
            Name = "Goblin",
            Size = new NamedSize { Width = 1, Height = 1 },
            MonsterData = new MonsterData()
        };

        // Act
        var updated = original with {
            Size = new NamedSize { Width = 1, Height = 1 },
            MonsterData = new MonsterData {
                TokenStyle = new TokenStyle {
                    BorderColor = "#00FF00",
                    Shape = TokenShape.Square
                }
            }
        };

        // Assert
        updated.MonsterData.Value.TokenStyle.Should().NotBeNull();
        updated.MonsterData.Value.TokenStyle!.Shape.Should().Be(TokenShape.Square);
    }
}