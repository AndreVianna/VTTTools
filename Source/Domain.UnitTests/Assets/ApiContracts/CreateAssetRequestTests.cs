namespace VttTools.Assets.ApiContracts;

public class CreateAssetRequestTests {
    [Fact]
    public void WithClause_ObjectAsset_UpdatesProperties() {
        // Arrange
        var original = new CreateAssetRequest {
            Kind = AssetKind.Object,
            Name = "Table",
            Description = "A table",
            Resources = [
                new AssetResourceDto {
                    ResourceId = Guid.CreateVersion7(),
                    Role = ResourceRole.Token
                }
            ],
            ObjectProps = new ObjectProperties {
                Size = new NamedSize { Width = 1, Height = 1, IsSquare = false },
                IsMovable = true,
                IsOpaque = false
            }
        };
        const string name = "Large Table";

        // Act
        var updated = original with {
            Name = name,
            ObjectProps = new ObjectProperties {
                Size = new NamedSize { Width = 2, Height = 1, IsSquare = false },
                IsMovable = false,
                IsOpaque = false
            }
        };

        // Assert
        updated.Name.Should().Be(name);
        updated.Kind.Should().Be(AssetKind.Object);
        updated.ObjectProps.Should().NotBeNull();
        updated.ObjectProps!.Size.Width.Should().Be(2);
        updated.ObjectProps.Size.Height.Should().Be(1);
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
                Size = new NamedSize { Width = 1, Height = 1, IsSquare = true },
                Category = CreatureCategory.Monster
            }
        };

        // Act
        var updated = original with {
            CreatureProps = new CreatureProperties {
                Size = new NamedSize { Width = 1, Height = 1, IsSquare = true },
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