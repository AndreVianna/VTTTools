namespace VttTools.Assets.ApiContracts;

public class CreateAssetRequestTests {
    [Fact]
    public void WithClause_ObjectAsset_UpdatesProperties() {
        var original = new CreateAssetRequest {
            Kind = AssetKind.Object,
            Name = "Table",
            Description = "A table",
            PortraitId = Guid.CreateVersion7(),
            TopDownId = Guid.CreateVersion7(),
            Size = new NamedSize { Width = 1, Height = 1 },
            ObjectData = new ObjectData {
                IsMovable = true,
                IsOpaque = false
            }
        };
        const string name = "Large Table";

        var updated = original with {
            Name = name,
            Size = new NamedSize { Width = 2, Height = 1 },
            ObjectData = new ObjectData {
                IsMovable = false,
                IsOpaque = false
            }
        };

        updated.Name.Should().Be(name);
        updated.Kind.Should().Be(AssetKind.Object);
        updated.Size.Width.Should().Be(2);
        updated.Size.Height.Should().Be(1);
        updated.ObjectData.Should().NotBeNull();
        updated.ObjectData.IsMovable.Should().BeFalse();
    }

    [Fact]
    public void WithClause_CreatureAsset_UpdatesProperties() {
        // Arrange
        var original = new CreateAssetRequest {
            Kind = AssetKind.Monster,
            Name = "Goblin",
            Description = "A goblin",
            Size = new NamedSize { Width = 1, Height = 1 },
            MonsterData = new MonsterData()
        };

        // Act
        var updated = original with {
            Size = new NamedSize { Width = 1, Height = 1 },
            MonsterData = new MonsterData {
                TokenStyle = new TokenStyle {
                    BorderColor = "#FF0000",
                    Shape = TokenShape.Circle
                }
            }
        };

        // Assert
        updated.Kind.Should().Be(AssetKind.Monster);
        updated.MonsterData.Should().NotBeNull();
        updated.MonsterData!.TokenStyle.Should().NotBeNull();
    }
}