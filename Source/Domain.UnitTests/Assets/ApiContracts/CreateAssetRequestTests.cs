namespace VttTools.Assets.ApiContracts;

public class CreateAssetRequestTests {
    [Fact]
    public void WithClause_ObjectAsset_UpdatesProperties() {
        // Arrange
        var original = new CreateAssetRequest {
            Kind = AssetKind.Object,
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
        const string name = "Large Table";

        // Act
        var updated = original with {
            Name = name,
            ObjectProps = new ObjectProperties {
                CellWidth = 2,
                CellHeight = 1,
                IsMovable = false,
                IsOpaque = false,
                IsVisible = true
            }
        };

        // Assert
        updated.Name.Should().Be(name);
        updated.Kind.Should().Be(AssetKind.Object);
        updated.ObjectProps.Should().NotBeNull();
        updated.ObjectProps!.CellWidth.Should().Be(2);
        updated.ObjectProps.IsMovable.Should().BeFalse();
    }

    [Fact]
    public void WithClause_CreatureAsset_UpdatesProperties() {
        // Arrange
        var original = new CreateAssetRequest {
            Kind = AssetKind.Creature,
            Name = "Goblin",
            Description = "A goblin",
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
                    BorderColor = "#FF0000",
                    Shape = TokenShape.Circle
                }
            }
        };

        // Assert
        updated.Kind.Should().Be(AssetKind.Creature);
        updated.CreatureProps.Should().NotBeNull();
        updated.CreatureProps!.Category.Should().Be(CreatureCategory.Character);
        updated.CreatureProps.TokenStyle.Should().NotBeNull();
    }
}