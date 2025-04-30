namespace VttTools.WebApp.Pages.Meeting;

public class MeetingsPageTests : WebAppTestContext {
    private readonly IGameService _service = Substitute.For<IGameService>();
    private readonly MeetingModel[] _defaultMeetings;

    public MeetingsPageTests() {
        Services.AddScoped<IGameService>(_ => _service);
        UseDefaultUser();
        _defaultMeetings = [
            new() { Subject = "Meeting 1", OwnerId = Options.CurrentUser!.Id },
            new() { Subject = "Meeting 2", OwnerId = Guid.NewGuid() },
        ];
    }

    [Fact]
    public void RendersLoadingState_WhenStateIsNull() {
        // Arrange
        _service.GetMeetingsAsync().Returns(Task.Delay(1000/*, Context.CancellationToken*/).ContinueWith(_ => _defaultMeetings));

        // Act
        var cut = RenderComponent<MeetingsPage>();

        // Assert
        cut.Markup.Should().Contain("""<span class="visually-hidden">Loading...</span>""");
    }

    [Fact]
    public void WhenNoMeetingsExist_RendersEmptyState() {
        // Arrange
        _service.GetMeetingsAsync().Returns([]);

        // Act
        var cut = RenderComponent<MeetingsPage>();

        // Assert
        cut.Markup.Should().Contain("You don't have any meetings yet. Create a new meeting to get started!");
    }

    [Fact]
    public void WhenStateHasMeetings_RendersMeetings() {
        // Arrange
        _service.GetMeetingsAsync().Returns(_defaultMeetings);

        // Act
        var cut = RenderComponent<MeetingsPage>();

        // Assert
        var cards = cut.FindAll(".card");
        cards.Count.Should().Be(2);

        cards[0].QuerySelector(".card-title")!.TextContent.Should().Be("Meeting 1");
        cards[0].QuerySelector(".join").Should().NotBeNull();
        cards[0].QuerySelector(".edit").Should().NotBeNull();
        cards[0].QuerySelector(".delete").Should().NotBeNull();

        cards[1].QuerySelector(".card-title")!.TextContent.Should().Be("Meeting 2");
        cards[1].QuerySelector(".join").Should().NotBeNull();
        cards[1].QuerySelector(".edit").Should().NotBeNull();
        cards[1].QuerySelector(".delete").Should().BeNull();
    }

    [Fact]
    public void WhenCreateButtonIsClicked_OpensCreateDialog() {
        // Arrange
        _service.GetMeetingsAsync().Returns(_defaultMeetings);
        var cut = RenderComponent<MeetingsPage>();
        var createButton = cut.Find("#create-meeting");

        // Act
        createButton.Click();
        cut.WaitForState(() => cut.Instance.State.IsCreating, TimeSpan.FromMilliseconds(500));

        // Assert
        cut.Find("#create-meeting-dialog").Should().NotBeNull();
    }

    [Fact]
    public void WhenJoinButtonIsClicked_NavigatesToMeeting() {
        // Arrange
        _service.GetMeetingsAsync().Returns(_defaultMeetings);
        var cut = RenderComponent<MeetingsPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        var meetingId = _defaultMeetings[0].Id;
        var joinButton = cut.Find($"#meeting-{meetingId} .join");
        _service.JoinMeetingAsync(Arg.Any<Guid>()).Returns(true);

        // Act
        joinButton.Click();

        // Assert
        navigationSpy.History.Should().ContainSingle(x => x.Uri == $"/game/{meetingId}");
    }

    [Fact]
    public void WhenEditButtonIsClicked_NavigatesToMeetingDetails() {
        // Arrange
        _service.GetMeetingsAsync().Returns(_defaultMeetings);
        var cut = RenderComponent<MeetingsPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        var meetingId = _defaultMeetings[0].Id;
        var editButton = cut.Find($"#meeting-{meetingId} .edit");

        // Act
        editButton.Click();

        // Assert
        navigationSpy.History.Should().ContainSingle(x => x.Uri == $"/meeting/{meetingId}");
    }
}