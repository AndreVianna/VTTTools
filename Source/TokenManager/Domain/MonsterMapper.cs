namespace VttTools.TokenManager.Domain;

public static class MonsterMapper {
    public static TokenEntity ToTokenEntity(this MonsterDefinition m) {
        var id = Slugify(m.Name); // "Adult Black Dragon" -> "adult-black-dragon"

        // crudely infer environments from type/traits later if you want
        var envs = Array.Empty<string>();

        var tags = new List<string> { "monster", m.CreatureType.ToLowerInvariant() };

        if (m.Size is { Length: > 0 })
            tags.Add(m.Size.ToLowerInvariant());

        if (m.Alignment is { Length: > 0 })
            tags.Add(m.Alignment.ToLowerInvariant());

        return new TokenEntity(
            Id: id,
            Name: m.Name,
            Type: EntityType.Monster,
            Subtype: m.CreatureType,
            Size: m.Size,
            Role: null,
            Tags: tags,
            Environments: envs
        );
    }

    public static string Slugify(string value) {
        var lower = value.Trim().ToLowerInvariant();
        var chars = lower.Select(c => char.IsLetterOrDigit(c) ? c : char.IsWhiteSpace(c) || c == '_' || c == '-' ? '-' : '-').ToArray();

        var slug = new string(chars);
        // collapse multiple '-'
        while (slug.Contains("--"))
            slug = slug.Replace("--", "-");

        return slug.Trim('-');
    }
}