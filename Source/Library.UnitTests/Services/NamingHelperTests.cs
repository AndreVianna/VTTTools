namespace VttTools.Library.UnitTests.Services;

public class NamingHelperTests {
    [Fact]
    public void GenerateCloneNames_FirstCloneOfUnnumberedScene_RenamesOriginalAndCreatesNumberedClone() {
        var originalName = "Forest Ambush";
        var existingNames = new[] { "Forest Ambush", "Dungeon Entrance" };

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("Forest Ambush (1)");
        cloneName.Should().Be("Forest Ambush (2)");
    }

    [Fact]
    public void GenerateCloneNames_CloneOfNumberedScene_CreatesIncrementedClone() {
        var originalName = "Forest Ambush (2)";
        var existingNames = new[] { "Forest Ambush (1)", "Forest Ambush (2)", "Dungeon Entrance" };

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("Forest Ambush (2)");
        cloneName.Should().Be("Forest Ambush (3)");
    }

    [Fact]
    public void GenerateCloneNames_CloneUnnumberedWhenNumberedExist_RenamesOriginalAndFindsNextNumber() {
        var originalName = "Forest Ambush";
        var existingNames = new[] { "Forest Ambush", "Forest Ambush (2)", "Forest Ambush (3)" };

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("Forest Ambush (1)");
        cloneName.Should().Be("Forest Ambush (4)");
    }

    [Fact]
    public void GenerateCloneNames_WithGapsInNumbering_UsesHighestNumber() {
        var originalName = "Scene (5)";
        var existingNames = new[] { "Scene (1)", "Scene (5)", "Scene (10)" };

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("Scene (5)");
        cloneName.Should().Be("Scene (11)");
    }

    [Fact]
    public void GenerateCloneNames_CaseInsensitiveMatching_FindsAllMatches() {
        var originalName = "forest ambush";
        var existingNames = new[] { "Forest Ambush", "FOREST AMBUSH (2)", "forest ambush (3)" };

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("forest ambush (1)");
        cloneName.Should().Be("forest ambush (4)");
    }

    [Fact]
    public void GenerateCloneNames_EmptyExistingNames_CreatesFirstAndSecond() {
        var originalName = "New Scene";
        var existingNames = Array.Empty<string>();

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("New Scene (1)");
        cloneName.Should().Be("New Scene (2)");
    }

    [Fact]
    public void GenerateCloneNames_NameWithParenthesesButNotNumber_TreatsAsUnnumbered() {
        var originalName = "Scene (final version)";
        var existingNames = new[] { "Scene (final version)" };

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("Scene (final version) (1)");
        cloneName.Should().Be("Scene (final version) (2)");
    }

    [Fact]
    public void GenerateCloneNames_NameEndingWithNumber_RecognizesPattern() {
        var originalName = "Level 3";
        var existingNames = new[] { "Level 3", "Other Scene" };

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("Level 3 (1)");
        cloneName.Should().Be("Level 3 (2)");
    }

    [Fact]
    public void GenerateCloneNames_MultipleSpacesBeforeNumber_HandlesCorrectly() {
        var originalName = "Scene   (5)";
        var existingNames = new[] { "Scene (1)", "Scene   (5)" };

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("Scene   (5)");
        cloneName.Should().Be("Scene (6)");
    }

    [Fact]
    public void GenerateCloneNames_OnlyNumberedScenesExist_DoesNotRenameOriginal() {
        var originalName = "Scene (1)";
        var existingNames = new[] { "Scene (1)", "Scene (2)" };

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("Scene (1)");
        cloneName.Should().Be("Scene (3)");
    }
}