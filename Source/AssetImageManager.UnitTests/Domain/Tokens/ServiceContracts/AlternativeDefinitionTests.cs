namespace VttTools.AssetImageManager.UnitTests.Domain.Tokens.ServiceContracts;

public sealed class AlternativeDefinitionTests {

    [Fact]
    public void Validate_ValidAlternative_ReturnsSuccess() {
        var alternative = new AlternativeDefinition {
            Gender = ["male", "female"]
        };

        var result = alternative.Validate();

        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_MultipleValidDimensions_ReturnsSuccess() {
        var alternative = new AlternativeDefinition {
            Gender = ["male", "female"],
            Class = ["warrior", "mage"],
            Equipment = ["Sword and Shield", "Staff"]
        };

        var result = alternative.Validate();

        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_NoDimensions_ReturnsError() {
        var alternative = new AlternativeDefinition();

        var result = alternative.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("At least one dimension"));
    }

    [Fact]
    public void Validate_EmptyGenderList_ReturnsError() {
        var alternative = new AlternativeDefinition {
            Gender = []
        };

        var result = alternative.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("Gender must have at least one item"));
    }

    [Fact]
    public void Validate_EmptyClassList_ReturnsError() {
        var alternative = new AlternativeDefinition {
            Class = []
        };

        var result = alternative.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("Class must have at least one item"));
    }

    [Fact]
    public void Validate_DuplicateGender_ReturnsError() {
        var alternative = new AlternativeDefinition {
            Gender = ["male", "male"]
        };

        var result = alternative.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("duplicate"));
    }

    [Fact]
    public void Validate_GenderNotLowercase_ReturnsError() {
        var alternative = new AlternativeDefinition {
            Gender = ["Male", "female"]
        };

        var result = alternative.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("lowercase letters"));
    }

    [Fact]
    public void Validate_ClassNotLowercase_ReturnsError() {
        var alternative = new AlternativeDefinition {
            Class = ["Warrior", "mage"]
        };

        var result = alternative.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("lowercase letters"));
    }

    [Fact]
    public void Validate_EquipmentCanHaveMixedCase_ReturnsSuccess() {
        var alternative = new AlternativeDefinition {
            Equipment = ["Sword and Shield", "Staff of Power"]
        };

        var result = alternative.Validate();

        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_MaterialCanHaveMixedCase_ReturnsSuccess() {
        var alternative = new AlternativeDefinition {
            Material = ["Iron", "Steel", "Mithril"]
        };

        var result = alternative.Validate();

        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_QualityCanHaveMixedCase_ReturnsSuccess() {
        var alternative = new AlternativeDefinition {
            Quality = ["Poor", "Common", "Masterwork"]
        };

        var result = alternative.Validate();

        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_NullOrEmptyItem_ReturnsError() {
        var alternative = new AlternativeDefinition {
            Gender = ["male", "", "female"]
        };

        var result = alternative.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("cannot be null or empty"));
    }

    [Fact]
    public void Validate_AllDimensionsValid_ReturnsSuccess() {
        var alternative = new AlternativeDefinition {
            Gender = ["male", "female"],
            Class = ["warrior", "mage", "rogue"],
            Equipment = ["Light Vestiment", "Heavy Vestiment"],
            Armor = ["Leather", "Chain Mail", "Plate"],
            Material = ["Iron", "Steel"],
            Quality = ["Common", "Rare"]
        };

        var result = alternative.Validate();

        result.HasErrors.Should().BeFalse();
    }
}
