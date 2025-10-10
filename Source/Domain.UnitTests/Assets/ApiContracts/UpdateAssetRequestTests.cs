using VttTools.Common.Model;

namespace VttTools.Assets.ApiContracts;

public class UpdateAssetRequestTests {
    [Fact]
    public void WithClause_ObjectAsset_UpdatesProperties() {
        // Arrange
        var originalResourceId = Guid.NewGuid();
        var original = new UpdateAssetRequest {
            Name = "Table",
            Description = "A table",
            Resources = new[] {
                new AssetResourceDto {
                    ResourceId = originalResourceId,
                    Role = ResourceRole.Token,
                    IsDefault = true
                }
            },
            ObjectProps = new ObjectProperties {
                Size = new NamedSize { Width = 1, Height = 1, IsSquare = false },
                IsMovable = true,
                IsOpaque = false
            }
        };
        const string newName = "Large Table";
        var newResourceId = Guid.NewGuid();

        // Act
        var updated = original with {
            Name = newName,
            Resources = new[] {
                new AssetResourceDto {
                    ResourceId = newResourceId,
                    Role = ResourceRole.Token | ResourceRole.Portrait,
                    IsDefault = true
                }
            },
            ObjectProps = new ObjectProperties {
                Size = new NamedSize { Width = 2, Height = 2, IsSquare = false },
                IsMovable = false,
                IsOpaque = false
            }
        };

        // Assert
        updated.Name.Value.Should().Be(newName);
        updated.Resources.Value.Should().HaveCount(1);
        updated.Resources.Value[0].ResourceId.Should().Be(newResourceId);
        updated.Resources.Value[0].Role.Should().Be(ResourceRole.Token | ResourceRole.Portrait);
        updated.Resources.Value[0].IsDefault.Should().BeTrue();
        updated.ObjectProps.Value.Size.Width.Should().Be(2);
        updated.ObjectProps.Value.Size.Height.Should().Be(2);
        updated.ObjectProps.Value.IsMovable.Should().BeFalse();
    }

    [Fact]
    public void WithClause_CreatureAsset_UpdatesProperties() {
        // Arrange
        var original = new UpdateAssetRequest {
            Name = "Goblin",
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