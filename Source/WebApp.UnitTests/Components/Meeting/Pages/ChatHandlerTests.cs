namespace VttTools.WebApp.Components.Meeting.Pages;

public sealed class ChatHandlerTests
    : IAsyncDisposable {
    private readonly Uri _chatUri = new("https://example.com/hubs/chat");
    private readonly Chat.Handler _handler = new();
    private readonly Chat.PageState _state = new();
    private bool _refreshCalled;

    public ValueTask DisposeAsync() => _handler.DisposeAsync();

    private Task RefreshAsync() {
        _refreshCalled = true;
        return Task.CompletedTask;
    }

    [Fact]
    public async Task OnMessageReceived_AddsMessageToStateAndCallsRefresh() {
        // Arrange
        await _handler.InitializeAsync(_chatUri, _state, RefreshAsync);

        // Act
        await _handler.OnMessageReceived("Test message");

        // Assert
        _state.Messages.Should().ContainSingle().Which.Text.Should().Be("Test message");
        _state.Messages.Should().ContainSingle().Which.Direction.Should().Be(ChatMessageDirection.Received);
        _refreshCalled.Should().BeTrue();
    }

    [Fact]
    public async Task SendMessage_WithNonEmptyMessage_SendsMessageAndClearsInput() {
        // Arrange
        await _handler.InitializeAsync(_chatUri, _state, RefreshAsync);
        _state.NewMessage = "Test message";

        // Act
        await _handler.SendMessage();

        // Assert
        _state.Messages.Should().ContainSingle().Which.Text.Should().Be("Test message");
        _state.Messages.Should().ContainSingle().Which.Direction.Should().Be(ChatMessageDirection.Sent);
        _refreshCalled.Should().BeTrue();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task SendMessage_WithEmptyMessage_DoesNotSendMessageAndReturnsEmpty(string? message) {
        // Arrange
        await _handler.InitializeAsync(_chatUri, _state, RefreshAsync);
        _state.NewMessage = message!;

        // Act
        await _handler.SendMessage();

        // Assert
        _state.Messages.Should().BeEmpty();
        _refreshCalled.Should().BeFalse();
    }
}