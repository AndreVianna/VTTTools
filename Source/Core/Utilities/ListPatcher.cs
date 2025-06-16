namespace VttTools.Utilities;

/// <summary>
/// Represents the operations to patch a list of items in a JSON payload.
/// </summary>
/// <typeparam name="T">The type of the list item.</typeparam>
public record ListPatcher<T>() {
    private readonly T[] _items = [];
    private readonly T[] _add = [];
    private readonly T[] _remove = [];

    public T[] Items => _add.Length > 0 || _remove.Length > 0
            ? throw new InvalidOperationException("Cannot use Items when Add or Remove are set.")
            : _items;
    public T[] Add => _items.Length > 0
            ? throw new InvalidOperationException("Cannot use Add when Items is set.")
            : _add;
    public T[] Remove => _items.Length > 0
            ? throw new InvalidOperationException("Cannot use Remove when Items is set.")
            : _remove;

    public ListPatcher(T[] add, T[] remove)
        : this() {
        _add = add;
        _remove = remove;
    }

    public ListPatcher(T[] items)
        : this() {
        _items = items;
    }

    public static implicit operator ListPatcher<T>(T[] values) => new(values);

    public static implicit operator ListPatcher<T>((T[] add, T[] remove) input) => new(input.add, input.remove);

    public virtual bool Equals(ListPatcher<T>? other)
        => other is not null && _items.Equals(other._items) && _add.Equals(other._add) && _remove.Equals(other._remove);

    public override int GetHashCode()
        => HashCode.Combine(_items, _add, _remove);

    public override string ToString() => JsonSerializer.Serialize(this);
}
