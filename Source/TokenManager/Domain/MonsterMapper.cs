namespace VttTools.TokenManager.Domain;

public static class MonsterMapper {
    public static TokenEntity ToTokenEntity(this MonsterDefinition m) {
        var id = Slugify(m.Name); // "Adult Black Dragon" -> "adult-black-dragon"

        // crudely infer environments from type/traits later if you want
        var envs = Array.Empty<string>();

        var tags = new List<string> { "monster" };

        if (!string.IsNullOrWhiteSpace(m.CreatureType))
            tags.Add(m.CreatureType.ToLowerInvariant());

        if (!string.IsNullOrWhiteSpace(m.Size))
            tags.Add(m.Size.ToLowerInvariant());

        if (!string.IsNullOrWhiteSpace(m.Alignment))
            tags.Add(m.Alignment.ToLowerInvariant());

        return new TokenEntity(
            Id: id,
            Name: m.Name,
            Type: EntityType.Monster,
            Subtype: m.CreatureType ?? string.Empty,
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