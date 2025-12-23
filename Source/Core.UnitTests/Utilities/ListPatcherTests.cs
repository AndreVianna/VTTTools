namespace VttTools.Utilities;

public class ListPatcherTests {
    [Fact]
    public void Constructor_WithItemsArray_CreatesListPatcherWithItems() {
        // Arrange
        var items = new[] { "item1", "item2", "item3" };

        // Act
        var patcher = new ListPatcher<string>(items);

        // Assert
        patcher.Items.Should().Equal(items);
    }

    [Fact]
    public void Constructor_WithAddAndRemoveArrays_CreatesListPatcherWithAddRemove() {
        // Arrange
        var add = new[] { "add1", "add2" };
        var remove = new[] { "remove1" };

        // Act
        var patcher = new ListPatcher<string>(add, remove);

        // Assert
        patcher.Add.Should().Equal(add);
        patcher.Remove.Should().Equal(remove);
    }

    [Fact]
    public void Constructor_Default_CreatesEmptyListPatcher() {
        // Arrange & Act
        var patcher = new ListPatcher<string>();

        // Assert
        patcher.Items.Should().BeEmpty();
    }

    [Fact]
    public void Items_WhenAddIsSet_ThrowsInvalidOperationException() {
        // Arrange
        var patcher = new ListPatcher<string>(["add1"], []);

        // Act & Assert
        patcher.Invoking(p => p.Items)
               .Should().Throw<InvalidOperationException>()
               .WithMessage("Cannot use Items when Add or Remove are set.");
    }

    [Fact]
    public void Items_WhenRemoveIsSet_ThrowsInvalidOperationException() {
        // Arrange
        var patcher = new ListPatcher<string>([], ["remove1"]);

        // Act & Assert
        patcher.Invoking(p => p.Items)
               .Should().Throw<InvalidOperationException>()
               .WithMessage("Cannot use Items when Add or Remove are set.");
    }

    [Fact]
    public void Add_WhenItemsIsSet_ThrowsInvalidOperationException() {
        // Arrange
        var patcher = new ListPatcher<string>(["item1"]);

        // Act & Assert
        patcher.Invoking(p => p.Add)
               .Should().Throw<InvalidOperationException>()
               .WithMessage("Cannot use Add when Items is set.");
    }

    [Fact]
    public void Remove_WhenItemsIsSet_ThrowsInvalidOperationException() {
        // Arrange
        var patcher = new ListPatcher<string>(["item1"]);

        // Act & Assert
        patcher.Invoking(p => p.Remove)
               .Should().Throw<InvalidOperationException>()
               .WithMessage("Cannot use Remove when Items is set.");
    }

    [Fact]
    public void ImplicitConversion_FromArray_CreatesListPatcherWithItems() {
        // Arrange
        var items = new[] { "item1", "item2" };

        // Act
        ListPatcher<string> patcher = items;

        // Assert
        patcher.Items.Should().Equal(items);
    }

    [Fact]
    public void ImplicitConversion_FromTuple_CreatesListPatcherWithAddRemove() {
        // Arrange
        var add = new[] { "add1" };
        var remove = new[] { "remove1" };

        // Act
        ListPatcher<string> patcher = (add, remove);

        // Assert
        patcher.Add.Should().Equal(add);
        patcher.Remove.Should().Equal(remove);
    }

    [Fact]
    public void Equals_WithSameItems_ReturnsTrue() {
        // Arrange
        var items = new[] { "item1", "item2" };
        var patcher1 = new ListPatcher<string>(items);
        var patcher2 = new ListPatcher<string>(items);

        // Act & Assert
        patcher1.Equals(patcher2).Should().BeTrue();
    }

    [Fact]
    public void Equals_WithDifferentItems_ReturnsFalse() {
        // Arrange
        var patcher1 = new ListPatcher<string>(["item1"]);
        var patcher2 = new ListPatcher<string>(["item2"]);

        // Act & Assert
        patcher1.Equals(patcher2).Should().BeFalse();
    }

    [Fact]
    public void Equals_WithNull_ReturnsFalse() {
        // Arrange
        var patcher = new ListPatcher<string>(["item1"]);

        // Act & Assert
        patcher.Equals(null).Should().BeFalse();
    }

    [Fact]
    public void GetHashCode_WithSameItems_ReturnsSameHashCode() {
        // Arrange
        var items = new[] { "item1", "item2" };
        var patcher1 = new ListPatcher<string>(items);
        var patcher2 = new ListPatcher<string>(items);

        // Act
        var hash1 = patcher1.GetHashCode();
        var hash2 = patcher2.GetHashCode();

        // Assert
        hash1.Should().Be(hash2);
    }

    [Fact]
    public void ToString_WithAddAndRemove_ThrowsInvalidOperationException() {
        // Arrange
        var patcher = new ListPatcher<string>(["add1", "add2"], ["remove1"]);

        // Act & Assert
        patcher.Invoking(p => p.ToString())
               .Should().Throw<InvalidOperationException>()
               .WithMessage("Cannot use Items when Add or Remove are set.");
    }

    [Fact]
    public void ToString_WithItems_ThrowsInvalidOperationException() {
        // Arrange
        var patcher = new ListPatcher<string>(["item1", "item2"]);

        // Act & Assert
        patcher.Invoking(p => p.ToString())
               .Should().Throw<InvalidOperationException>()
               .WithMessage("Cannot use Add when Items is set.");
    }

    [Fact]
    public void ToString_WithEmptyPatcher_SerializesSuccessfully() {
        // Arrange
        var patcher = new ListPatcher<string>();

        // Act
        var result = patcher.ToString();

        // Assert
        result.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void Apply_WithItems_ReturnsItems() {
        // Arrange
        var items = new[] { "new1", "new2" };
        var patcher = new ListPatcher<string>(items);
        var current = new[] { "old1", "old2" };

        // Act
        var result = patcher.Apply(current);

        // Assert
        result.Should().Equal(items);
    }

    [Fact]
    public void Apply_WithEmptyAddAndRemove_ReturnsCurrentList() {
        // Arrange
        var patcher = new ListPatcher<string>([], []);
        var current = new[] { "item1", "item2" };

        // Act
        var result = patcher.Apply(current);

        // Assert
        result.Should().Equal(current);
    }

    [Fact]
    public void Apply_WithAdd_AddsItemsToCurrentList() {
        // Arrange
        var patcher = new ListPatcher<string>(["new1", "new2"], []);
        var current = new[] { "item1" };

        // Act
        var result = patcher.Apply(current);

        // Assert
        result.Should().Equal("item1", "new1", "new2");
    }

    [Fact]
    public void Apply_WithRemove_RemovesItemsFromCurrentList() {
        // Arrange
        var patcher = new ListPatcher<string>([], ["item1"]);
        var current = new[] { "item1", "item2", "item3" };

        // Act
        var result = patcher.Apply(current);

        // Assert
        result.Should().Equal("item2", "item3");
    }

    [Fact]
    public void Apply_WithAddAndRemove_AppliesBothOperations() {
        // Arrange
        var patcher = new ListPatcher<string>(["new1"], ["item2"]);
        var current = new[] { "item1", "item2", "item3" };

        // Act
        var result = patcher.Apply(current);

        // Assert
        result.Should().Equal("item1", "item3", "new1");
    }

    [Fact]
    public void Apply_WithDuplicateInAdd_DoesNotAddDuplicate() {
        // Arrange
        var patcher = new ListPatcher<string>(["item1"], []);
        var current = new[] { "item1", "item2" };

        // Act
        var result = patcher.Apply(current);

        // Assert
        result.Should().Equal("item1", "item2");
    }

    [Fact]
    public void Apply_WithMultipleSameItemsInAdd_AddsOnlyOnce() {
        // Arrange
        var patcher = new ListPatcher<string>(["new1", "new1", "new2"], []);
        var current = new[] { "item1" };

        // Act
        var result = patcher.Apply(current);

        // Assert
        result.Should().Equal("item1", "new1", "new2");
    }

    [Fact]
    public void Apply_RemovingNonExistentItem_DoesNotThrow() {
        // Arrange
        var patcher = new ListPatcher<string>([], ["nonexistent"]);
        var current = new[] { "item1", "item2" };

        // Act
        var result = patcher.Apply(current);

        // Assert
        result.Should().Equal("item1", "item2");
    }

    [Fact]
    public void Apply_WithEmptyCurrentList_AddsNewItems() {
        // Arrange
        var patcher = new ListPatcher<string>(["new1", "new2"], []);
        var current = Array.Empty<string>();

        // Act
        var result = patcher.Apply(current);

        // Assert
        result.Should().Equal("new1", "new2");
    }

    [Fact]
    public void Apply_WithValueTypes_WorksCorrectly() {
        // Arrange
        var patcher = new ListPatcher<int>([4, 5], [2]);
        var current = new[] { 1, 2, 3 };

        // Act
        var result = patcher.Apply(current);

        // Assert
        result.Should().Equal(1, 3, 4, 5);
    }
}
