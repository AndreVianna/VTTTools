namespace VttTools.Assets.ApiContracts;

public class UpdateAssetRequestTests {
    [Fact]
    public void WithClause_ObjectAsset_UpdatesProperties() {
        // Arrange
        var original = new UpdateAssetRequest {
            Name = "Table",
            Description = "A table",
            ResourceId = Guid.NewGuid(),
            ObjectProps = new ObjectProperties {
                CellWidth = 1,
                CellHeight = 1,
                IsMovable = true,
                IsOpaque = false,
                IsVisible = true
            }
        };
        const string newName = "Large Table";
        var newResourceId = Guid.NewGuid();

        // Act
        var updated = original with {
            Name = newName,
            ResourceId = newResourceId,
            ObjectProps = new ObjectProperties {
                CellWidth = 2,
                CellHeight = 2,
                IsMovable = false,
                IsOpaque = false,
                IsVisible = true
            }
        };

        // Assert
        updated.Name.Value.Should().Be(newName);
        updated.ResourceId.Value.Should().Be(newResourceId);
        updated.ObjectProps.Value.CellWidth.Should().Be(2);
        updated.ObjectProps.Value.IsMovable.Should().BeFalse();
    }

    [Fact]
    public void WithClause_CreatureAsset_UpdatesProperties() {
        // Arrange
        var original = new UpdateAssetRequest {
            Name = "Goblin",
            CreatureProps = new CreatureProperties {
                CellSize = 1,
                Category = CreatureCategory.Monster
            }
        };

        // Act
        var updated = original with {
            CreatureProps = new CreatureProperties {
                CellSize = 1,
                Category = CreatureCategory.Character,
                TokenStyle = new TokenStyle {
                    BorderColor = "#00FF00",
                    Shape = TokenShape.Square
                }
            }
        };

        // Assert
        updated.CreatureProps.Value.Category.Should().Be(CreatureCategory.Character);
        updated.CreatureProps.Value.TokenStyle.Should().NotBeNull();
        updated.CreatureProps.Value.TokenStyle!.Shape.Should().Be(TokenShape.Square);
    }
}
