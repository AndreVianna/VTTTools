namespace VttTools.Library.UnitTests.Services;

public class NamingHelperTests {
    [Fact]
    public void GenerateCloneNames_FirstCloneOfUnnumberedEncounter_RenamesOriginalAndCreatesNumberedClone() {
        const string originalName = "Forest Ambush";
        var existingNames = new[] { "Forest Ambush", "Dungeon Entrance" };

        (var newOriginalName, var cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("Forest Ambush (1)");
        cloneName.Should().Be("Forest Ambush (2)");
    }

    [Fact]
    public void GenerateCloneNames_CloneOfNumberedEncounter_CreatesIncrementedClone() {
        const string originalName = "Forest Ambush (2)";
        var existingNames = new[] { "Forest Ambush (1)", "Forest Ambush (2)", "Dungeon Entrance" };

        (var newOriginalName, var cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("Forest Ambush (2)");
        cloneName.Should().Be("Forest Ambush (3)");
    }

    [Fact]
    public void GenerateCloneNames_CloneUnnumberedWhenNumberedExist_RenamesOriginalAndFindsNextNumber() {
        const string originalName = "Forest Ambush";
        var existingNames = new[] { "Forest Ambush", "Forest Ambush (2)", "Forest Ambush (3)" };

        (var newOriginalName, var cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("Forest Ambush (1)");
        cloneName.Should().Be("Forest Ambush (4)");
    }

    [Fact]
    public void GenerateCloneNames_WithGapsInNumbering_UsesHighestNumber() {
        const string originalName = "Encounter (5)";
        var existingNames = new[] { "Encounter (1)", "Encounter (5)", "Encounter (10)" };

        (var newOriginalName, var cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("Encounter (5)");
        cloneName.Should().Be("Encounter (11)");
    }

    [Fact]
    public void GenerateCloneNames_CaseInsensitiveMatching_FindsAllMatches() {
        const string originalName = "forest ambush";
        var existingNames = new[] { "Forest Ambush", "FOREST AMBUSH (2)", "forest ambush (3)" };

        (var newOriginalName, var cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("forest ambush (1)");
        cloneName.Should().Be("forest ambush (4)");
    }

    [Fact]
    public void GenerateCloneNames_EmptyExistingNames_CreatesFirstAndSecond() {
        const string originalName = "New Encounter";
        var existingNames = Array.Empty<string>();

        (var newOriginalName, var cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("New Encounter (1)");
        cloneName.Should().Be("New Encounter (2)");
    }

    [Fact]
    public void GenerateCloneNames_NameWithParenthesesButNotNumber_TreatsAsUnnumbered() {
        const string originalName = "Encounter (final version)";
        var existingNames = new[] { "Encounter (final version)" };

        (var newOriginalName, var cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("Encounter (final version) (1)");
        cloneName.Should().Be("Encounter (final version) (2)");
    }

    [Fact]
    public void GenerateCloneNames_NameEndingWithNumber_RecognizesPattern() {
        const string originalName = "Level 3";
        var existingNames = new[] { "Level 3", "Other Encounter" };

        (var newOriginalName, var cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("Level 3 (1)");
        cloneName.Should().Be("Level 3 (2)");
    }

    [Fact]
    public void GenerateCloneNames_MultipleSpacesBeforeNumber_HandlesCorrectly() {
        const string originalName = "Encounter   (5)";
        var existingNames = new[] { "Encounter (1)", "Encounter   (5)" };

        (var newOriginalName, var cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("Encounter   (5)");
        cloneName.Should().Be("Encounter (6)");
    }

    [Fact]
    public void GenerateCloneNames_OnlyNumberedEncountersExist_DoesNotRenameOriginal() {
        const string originalName = "Encounter (1)";
        var existingNames = new[] { "Encounter (1)", "Encounter (2)" };

        (var newOriginalName, var cloneName) = NamingHelper.GenerateCloneNames(originalName, existingNames);

        newOriginalName.Should().Be("Encounter (1)");
        cloneName.Should().Be("Encounter (3)");
    }
}