namespace VttTools.Assets.ApiContracts;

public class UpdateAssetRequestTests {
    [Fact]
    public void WithClause_ObjectAsset_UpdatesProperties() {
        // Arrange
        var originalResourceId = Guid.CreateVersion7();
        var original = new UpdateAssetRequest {
            Name = "Table",
            Description = "A table",
            Tokens = new[] {
                new AssetTokenData {
                    TokenId = originalResourceId,
                    IsDefault = true
                }
            },
            Size = new NamedSize { Width = 1, Height = 1 },
            ObjectData = new ObjectData {
                IsMovable = true,
                IsOpaque = false
            }
        };
        const string newName = "Large Table";
        var newResourceId = Guid.CreateVersion7();

        // Act
        var updated = original with {
            Name = newName,
            Tokens = new[] {
                new AssetTokenData {
                    TokenId = newResourceId,
                    IsDefault = false
                }
            },
            Size = new NamedSize { Width = 2, Height = 2 },
            ObjectData = new ObjectData {
                IsMovable = false,
                IsOpaque = false
            }
        };

        // Assert
        updated.Name.Value.Should().Be(newName);
        updated.Tokens.Value.Should().HaveCount(1);
        updated.Tokens.Value[0].TokenId.Should().Be(newResourceId);
        updated.Tokens.Value[0].IsDefault.Should().BeFalse();
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
            CreatureData = new CreatureData {
                Category = CreatureCategory.Monster
            }
        };

        // Act
        var updated = original with {
            Size = new NamedSize { Width = 1, Height = 1 },
            CreatureData = new CreatureData {
                Category = CreatureCategory.Character,
                TokenStyle = new TokenStyle {
                    BorderColor = "#00FF00",
                    Shape = TokenShape.Square
                }
            }
        };

        // Assert
        updated.CreatureData.Value.Category.Should().Be(CreatureCategory.Character);
        updated.CreatureData.Value.TokenStyle.Should().NotBeNull();
        updated.CreatureData.Value.TokenStyle!.Shape.Should().Be(TokenShape.Square);
    }
}