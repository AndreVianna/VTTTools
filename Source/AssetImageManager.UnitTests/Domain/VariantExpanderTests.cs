namespace VttTools.AssetImageManager.Domain;

public class VariantExpanderTests {
    [Fact]
    public void ExpandAlternatives_WithNullAlternatives_ThrowsArgumentNullException() {
        var exception = Assert.Throws<ArgumentNullException>(() =>
            VariantExpander.ExpandAlternatives(null!));

        Assert.Equal("alternatives", exception.ParamName);
    }

    [Fact]
    public void ExpandAlternatives_WithAllNullDimensions_ReturnsSingleBaseVariant() {
        var alternatives = new AlternativeDefinition {
            Gender = null,
            Class = null,
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Single(variants);
        Assert.Equal("base", variants[0].VariantId);
        Assert.Null(variants[0].Gender);
        Assert.Null(variants[0].Class);
        Assert.Null(variants[0].Equipment);
        Assert.Null(variants[0].Vestment);
        Assert.Null(variants[0].Material);
        Assert.Null(variants[0].Quality);
    }

    [Fact]
    public void ExpandAlternatives_WithAllEmptyArrays_ReturnsSingleBaseVariant() {
        var alternatives = new AlternativeDefinition {
            Gender = [],
            Class = [],
            Equipment = [],
            Armor = [],
            Material = [],
            Quality = []
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Single(variants);
        Assert.Equal("base", variants[0].VariantId);
    }

    [Fact]
    public void ExpandAlternatives_WithSingleDimensionOneValue_ReturnsOneVariant() {
        var alternatives = new AlternativeDefinition {
            Gender = ["male"],
            Class = null,
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Single(variants);
        Assert.Equal("male", variants[0].VariantId);
        Assert.Equal("male", variants[0].Gender);
    }

    [Fact]
    public void ExpandAlternatives_WithSingleDimensionTwoValues_ReturnsTwoVariants() {
        var alternatives = new AlternativeDefinition {
            Gender = ["male", "female"],
            Class = null,
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Equal(2, variants.Count);
        Assert.Equal("male", variants[0].VariantId);
        Assert.Equal("male", variants[0].Gender);
        Assert.Equal("female", variants[1].VariantId);
        Assert.Equal("female", variants[1].Gender);
    }

    [Fact]
    public void ExpandAlternatives_WithTwoDimensions2x2_ReturnsFourVariants() {
        var alternatives = new AlternativeDefinition {
            Gender = ["male", "female"],
            Class = ["warrior", "mage"],
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Equal(4, variants.Count);

        Assert.Equal("male-warrior", variants[0].VariantId);
        Assert.Equal("male", variants[0].Gender);
        Assert.Equal("warrior", variants[0].Class);

        Assert.Equal("male-mage", variants[1].VariantId);
        Assert.Equal("male", variants[1].Gender);
        Assert.Equal("mage", variants[1].Class);

        Assert.Equal("female-warrior", variants[2].VariantId);
        Assert.Equal("female", variants[2].Gender);
        Assert.Equal("warrior", variants[2].Class);

        Assert.Equal("female-mage", variants[3].VariantId);
        Assert.Equal("female", variants[3].Gender);
        Assert.Equal("mage", variants[3].Class);
    }

    [Fact]
    public void ExpandAlternatives_WithThreeDimensions2x3x2_ReturnsTwelveVariants() {
        var alternatives = new AlternativeDefinition {
            Gender = ["male", "female"],
            Class = ["warrior", "mage", "rogue"],
            Equipment = ["sword", "staff"],
            Armor = null,
            Material = null,
            Quality = null
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Equal(12, variants.Count);
        Assert.Equal("male-warrior-sword", variants[0].VariantId);
        Assert.Equal("male-warrior-staff", variants[1].VariantId);
        Assert.Equal("male-mage-sword", variants[2].VariantId);
        Assert.Equal("female-rogue-staff", variants[11].VariantId);
    }

    [Fact]
    public void ExpandAlternatives_WithAllSixDimensions_ReturnsCorrectCartesianProduct() {
        var alternatives = new AlternativeDefinition {
            Gender = ["male", "female"],
            Class = ["warrior"],
            Equipment = ["sword", "axe"],
            Armor = ["leather"],
            Material = ["iron", "steel"],
            Quality = ["normal"]
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Equal(8, variants.Count);

        var firstVariant = variants[0];
        Assert.Equal("male-warrior-sword-leather-iron-normal", firstVariant.VariantId);
        Assert.Equal("male", firstVariant.Gender);
        Assert.Equal("warrior", firstVariant.Class);
        Assert.Equal("sword", firstVariant.Equipment);
        Assert.Equal("leather", firstVariant.Vestment);
        Assert.Equal("iron", firstVariant.Material);
        Assert.Equal("normal", firstVariant.Quality);
    }

    [Fact]
    public void ExpandAlternatives_WithCanonicalOrdering_ReturnsVariantsInCorrectOrder() {
        var alternatives = new AlternativeDefinition {
            Gender = ["a"],
            Class = ["b"],
            Equipment = ["c"],
            Armor = ["d"],
            Material = ["e"],
            Quality = ["f"]
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Single(variants);
        Assert.Equal("a-b-c-d-e-f", variants[0].VariantId);
    }

    [Fact]
    public void ExpandAlternatives_WithMixedNullAndPopulatedDimensions_SkipsNullsInVariantId() {
        var alternatives = new AlternativeDefinition {
            Gender = ["male"],
            Class = null,
            Equipment = ["sword"],
            Armor = null,
            Material = null,
            Quality = null
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Single(variants);
        Assert.Equal("male-sword", variants[0].VariantId);
        Assert.Null(variants[0].Class);
    }

    [Fact]
    public void ExpandAlternatives_WithValuesContainingSpaces_ReplacesSpacesWithHyphens() {
        var alternatives = new AlternativeDefinition {
            Gender = ["Male Warrior"],
            Class = null,
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Single(variants);
        Assert.Equal("male-warrior", variants[0].VariantId);
        Assert.Equal("Male Warrior", variants[0].Gender);
    }

    [Fact]
    public void ExpandAlternatives_WithValuesContainingHyphens_PreservesHyphens() {
        var alternatives = new AlternativeDefinition {
            Gender = ["non-binary"],
            Class = null,
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Single(variants);
        Assert.Equal("non-binary", variants[0].VariantId);
        Assert.Equal("non-binary", variants[0].Gender);
    }

    [Fact]
    public void ExpandAlternatives_WithInvalidPathCharacters_SanitizesCorrectly() {
        var alternatives = new AlternativeDefinition {
            Gender = ["../../../etc/passwd"],
            Class = null,
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Single(variants);
        Assert.Equal("etcpasswd", variants[0].VariantId);
    }

    [Fact]
    public void ExpandAlternatives_WithEmptyStringValue_ThrowsArgumentException() {
        var alternatives = new AlternativeDefinition {
            Gender = [""],
            Class = null,
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var exception = Assert.Throws<ArgumentException>(() =>
            VariantExpander.ExpandAlternatives(alternatives));

        Assert.Contains("cannot be empty or whitespace", exception.Message);
    }

    [Fact]
    public void ExpandAlternatives_WithWhitespaceValue_ThrowsArgumentException() {
        var alternatives = new AlternativeDefinition {
            Gender = ["   "],
            Class = null,
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var exception = Assert.Throws<ArgumentException>(() =>
            VariantExpander.ExpandAlternatives(alternatives));

        Assert.Contains("cannot be empty or whitespace", exception.Message);
    }

    [Fact]
    public void ExpandAlternatives_WithDefaultMaxVariants_AcceptsUpTo10000Variants() {
        var alternatives = new AlternativeDefinition {
            Gender = [.. Enumerable.Range(1, 100).Select(i => $"gender{i}")],
            Class = [.. Enumerable.Range(1, 100).Select(i => $"class{i}")],
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Equal(10_000, variants.Count);
    }

    [Fact]
    public void ExpandAlternatives_ExceedingDefaultMaxVariants_ThrowsInvalidOperationException() {
        var alternatives = new AlternativeDefinition {
            Gender = [.. Enumerable.Range(1, 101).Select(i => $"gender{i}")],
            Class = [.. Enumerable.Range(1, 100).Select(i => $"class{i}")],
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var exception = Assert.Throws<InvalidOperationException>(() =>
            VariantExpander.ExpandAlternatives(alternatives));

        Assert.Contains("10,100 variants", exception.Message);
        Assert.Contains("exceeds the safety limit of 10,000", exception.Message);
    }

    [Fact]
    public void ExpandAlternatives_WithCustomMaxVariants_RespectsLimit() {
        var alternatives = new AlternativeDefinition {
            Gender = [.. Enumerable.Range(1, 10).Select(i => $"gender{i}")],
            Class = [.. Enumerable.Range(1, 10).Select(i => $"class{i}")],
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives, maxVariants: 100);

        Assert.Equal(100, variants.Count);
    }

    [Fact]
    public void ExpandAlternatives_ExceedingCustomMaxVariants_ThrowsWithCustomLimit() {
        var alternatives = new AlternativeDefinition {
            Gender = [.. Enumerable.Range(1, 10).Select(i => $"gender{i}")],
            Class = [.. Enumerable.Range(1, 10).Select(i => $"class{i}")],
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var exception = Assert.Throws<InvalidOperationException>(() =>
            VariantExpander.ExpandAlternatives(alternatives, maxVariants: 50));

        Assert.Contains("100 variants", exception.Message);
        Assert.Contains("exceeds the safety limit of 50", exception.Message);
    }

    [Fact]
    public void ExpandAlternatives_WithZeroMaxVariants_ThrowsArgumentException() {
        var alternatives = new AlternativeDefinition {
            Gender = ["male"],
            Class = null,
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var exception = Assert.Throws<ArgumentException>(() =>
            VariantExpander.ExpandAlternatives(alternatives, maxVariants: 0));

        Assert.Equal("maxVariants", exception.ParamName);
        Assert.Contains("must be greater than zero", exception.Message);
    }

    [Fact]
    public void ExpandAlternatives_WithNegativeMaxVariants_ThrowsArgumentException() {
        var alternatives = new AlternativeDefinition {
            Gender = ["male"],
            Class = null,
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var exception = Assert.Throws<ArgumentException>(() =>
            VariantExpander.ExpandAlternatives(alternatives, maxVariants: -100));

        Assert.Equal("maxVariants", exception.ParamName);
        Assert.Contains("must be greater than zero", exception.Message);
    }

    [Fact]
    public void ExpandAlternatives_WithDuplicateValues_DetectsDuplicateVariantIds() {
        var alternatives = new AlternativeDefinition {
            Gender = ["male", "male"],
            Class = null,
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var exception = Assert.Throws<InvalidOperationException>(() =>
            VariantExpander.ExpandAlternatives(alternatives));

        Assert.Contains("Duplicate variant ID detected: male", exception.Message);
    }

    [Fact]
    public void ExpandAlternatives_WithDuplicateAcrossDimensions_GeneratesCorrectVariantId() {
        var alternatives = new AlternativeDefinition {
            Gender = ["test"],
            Class = ["test"],
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Single(variants);
        Assert.Equal("test-test", variants[0].VariantId);
    }

    [Fact]
    public void ExpandAlternatives_ReturnsReadOnlyList() {
        var alternatives = new AlternativeDefinition {
            Gender = ["male"],
            Class = null,
            Equipment = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.IsType<IReadOnlyList<StructuralVariant>>(variants, exactMatch: false);
    }

    [Fact]
    public void ExpandAlternatives_WithLargeCartesianProduct_RespectsMaxVariantsLimit() {
        var alternatives = new AlternativeDefinition {
            Gender = [.. Enumerable.Range(1, 50).Select(i => $"g{i}")],
            Class = [.. Enumerable.Range(1, 50).Select(i => $"c{i}")],
            Equipment = [.. Enumerable.Range(1, 5).Select(i => $"e{i}")],
            Armor = null,
            Material = null,
            Quality = null
        };

        var exception = Assert.Throws<InvalidOperationException>(() =>
            VariantExpander.ExpandAlternatives(alternatives));

        Assert.Contains("12,500 variants", exception.Message);
        Assert.Contains("exceeds the safety limit", exception.Message);
    }

    [Fact]
    public void ExpandAlternatives_WithAndInValue_ReplacesWithPlus() {
        var alternatives = new AlternativeDefinition {
            Equipment = ["scimitar and shield", "bow and arrow"],
            Gender = null,
            Class = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Equal(2, variants.Count);
        Assert.Equal("scimitar+shield", variants[0].VariantId);
        Assert.Equal("bow+arrow", variants[1].VariantId);
    }

    [Fact]
    public void ExpandAlternatives_WithSpecialWords_ReplacesCorrectly() {
        var alternatives = new AlternativeDefinition {
            Equipment = ["Staff of Power", "Helm & Shield", "Eve's Sword"],
            Gender = null,
            Class = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Equal(3, variants.Count);
        Assert.Equal("staff-of-power", variants[0].VariantId);
        Assert.Equal("helm+shield", variants[1].VariantId);
        Assert.Equal("eves-sword", variants[2].VariantId);
    }

    [Fact]
    public void ExpandAlternatives_WithSpecialCharacters_RemovesInvalidChars() {
        var alternatives = new AlternativeDefinition {
            Equipment = ["Sword+1", "Shield (Medium)", "Vestment [Heavy]"],
            Gender = null,
            Class = null,
            Armor = null,
            Material = null,
            Quality = null
        };

        var variants = VariantExpander.ExpandAlternatives(alternatives);

        Assert.Equal(3, variants.Count);
        Assert.Equal("sword+1", variants[0].VariantId);
        Assert.Equal("shield-medium", variants[1].VariantId);
        Assert.Equal("armor-heavy", variants[2].VariantId);
    }
}
