namespace VttTools.AssetImageManager.UnitTests.Domain.Tokens.ServiceContracts;

public sealed class EntityDefinitionTests {

    [Fact]
    public void Validate_ValidEntity_ReturnsSuccess() {
        var entity = new EntityDefinition {
            Name = "Goblin",
            Genre = "Fantasy",
            Category = "creatures",
            Type = "humanoid",
            Subtype = "goblinoid",
            PhysicalDescription = "A small green creature with pointy ears",
            Alternatives = [
                new AlternativeDefinition {
                    Gender = ["male", "female"]
                }
            ],
            SchemaVersion = 1
        };

        var result = entity.Validate();

        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_InvalidSchemaVersion_ReturnsError() {
        var entity = new EntityDefinition {
            Name = "Goblin",
            Category = "creatures",
            Type = "humanoid",
            Subtype = "goblinoid",
            PhysicalDescription = "A small green creature",
            Alternatives = [new AlternativeDefinition { Gender = ["male"] }],
            SchemaVersion = 2
        };

        var result = entity.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("schema version 1"));
    }

    [Fact]
    public void Validate_EmptyName_ReturnsError() {
        var entity = new EntityDefinition {
            Name = "",
            Category = "creatures",
            Type = "humanoid",
            Subtype = "goblinoid",
            PhysicalDescription = "Description",
            Alternatives = [new AlternativeDefinition { Gender = ["male"] }]
        };

        var result = entity.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("name cannot be null or empty"));
    }

    [Fact]
    public void Validate_NameTooLong_ReturnsError() {
        var entity = new EntityDefinition {
            Name = new string('a', 129),
            Category = "creatures",
            Type = "humanoid",
            Subtype = "goblinoid",
            PhysicalDescription = "Description",
            Alternatives = [new AlternativeDefinition { Gender = ["male"] }]
        };

        var result = entity.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("cannot exceed 128 characters"));
    }

    [Fact]
    public void Validate_NameWithInvalidCharacters_ReturnsError() {
        var entity = new EntityDefinition {
            Name = "Goblin-Chief!",
            Category = "creatures",
            Type = "humanoid",
            Subtype = "goblinoid",
            PhysicalDescription = "Description",
            Alternatives = [new AlternativeDefinition { Gender = ["male"] }]
        };

        var result = entity.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("alphanumeric characters and spaces"));
    }

    [Fact]
    public void Validate_InvalidCategory_ReturnsError() {
        var entity = new EntityDefinition {
            Name = "Goblin",
            Category = "monsters",
            Type = "humanoid",
            Subtype = "goblinoid",
            PhysicalDescription = "Description",
            Alternatives = [new AlternativeDefinition { Gender = ["male"] }]
        };

        var result = entity.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("must be 'creatures', 'objects', or 'characters'"));
    }

    [Fact]
    public void Validate_InvalidAlternative_ReturnsError() {
        var entity = new EntityDefinition {
            Name = "Goblin",
            Category = "creatures",
            Type = "humanoid",
            Subtype = "goblinoid",
            PhysicalDescription = "Description",
            Alternatives = [
                new AlternativeDefinition(),
            ]
        };

        var result = entity.Validate();

        result.HasErrors.Should().BeTrue();
    }

    [Fact]
    public void Validate_DistinctiveFeaturesTooLong_ReturnsError() {
        var entity = new EntityDefinition {
            Name = "Goblin",
            Category = "creatures",
            Type = "humanoid",
            Subtype = "goblinoid",
            PhysicalDescription = "Description",
            DistinctiveFeatures = new string('a', 1025),
            Alternatives = [new AlternativeDefinition { Gender = ["male"] }]
        };

        var result = entity.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("distinctive features") && e.Message.Contains("1024"));
    }

    [Fact]
    public void Validate_EnvironmentTooLong_ReturnsError() {
        var entity = new EntityDefinition {
            Name = "Goblin",
            Category = "creatures",
            Type = "humanoid",
            Subtype = "goblinoid",
            PhysicalDescription = "Description",
            Environment = new string('a', 257),
            Alternatives = [new AlternativeDefinition { Gender = ["male"] }]
        };

        var result = entity.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("environment") && e.Message.Contains("256"));
    }

    [Fact]
    public void Validate_PhysicalDescriptionTooLong_ReturnsError() {
        var entity = new EntityDefinition {
            Name = "Goblin",
            Category = "creatures",
            Type = "humanoid",
            Subtype = "goblinoid",
            PhysicalDescription = new string('a', 2049),
            Alternatives = [new AlternativeDefinition { Gender = ["male"] }]
        };

        var result = entity.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("physical description") && e.Message.Contains("2048"));
    }

    [Fact]
    public void Validate_EmptyGenre_DefaultsToFantasy() {
        var entity = new EntityDefinition {
            Name = "Goblin",
            Genre = "",
            Category = "creatures",
            Type = "humanoid",
            Subtype = "goblinoid",
            PhysicalDescription = "A small green creature",
            Alternatives = [new AlternativeDefinition { Gender = ["male"] }]
        };

        var result = entity.Validate();

        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_NullGenre_DefaultsToFantasy() {
        var entity = new EntityDefinition {
            Name = "Goblin",
            Genre = null!,
            Category = "creatures",
            Type = "humanoid",
            Subtype = "goblinoid",
            PhysicalDescription = "A small green creature",
            Alternatives = [new AlternativeDefinition { Gender = ["male"] }]
        };

        var result = entity.Validate();

        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_GenreTooLong_ReturnsError() {
        var entity = new EntityDefinition {
            Name = "Goblin",
            Genre = new string('a', 65),
            Category = "creatures",
            Type = "humanoid",
            Subtype = "goblinoid",
            PhysicalDescription = "A small green creature",
            Alternatives = [new AlternativeDefinition { Gender = ["male"] }]
        };

        var result = entity.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("genre") && e.Message.Contains("64"));
    }

    [Fact]
    public void Validate_GenreWithInvalidCharacters_ReturnsError() {
        var entity = new EntityDefinition {
            Name = "Goblin",
            Genre = "Fantasy-SciFi!",
            Category = "creatures",
            Type = "humanoid",
            Subtype = "goblinoid",
            PhysicalDescription = "A small green creature",
            Alternatives = [new AlternativeDefinition { Gender = ["male"] }]
        };

        var result = entity.Validate();

        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("genre") && e.Message.Contains("alphanumeric"));
    }
}
