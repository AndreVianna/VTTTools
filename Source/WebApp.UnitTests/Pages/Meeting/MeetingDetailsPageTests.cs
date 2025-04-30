namespace VttTools.WebApp.Pages.Meeting;

public class MeetingDetailsPageTests : WebAppTestContext {
    private readonly IGameService _service = Substitute.For<IGameService>();
    private readonly Guid _meetingId = Guid.NewGuid();
    private readonly MeetingModel? _defaultMeeting;

    public MeetingDetailsPageTests() {
        Services.AddScoped<IGameService>(_ => _service);
        UseDefaultUser();
        _defaultMeeting = new() { Subject = "Meeting 1", OwnerId = Options.CurrentUser!.Id };
    }

    [Fact]
    public void MeetingDetails_RendersLoadingState_WhenMeetingIsNull() {
        // Arrange
        _service.GetMeetingByIdAsync(Arg.Any<Guid>()).Returns(Task.Delay(1000/*, Context.CancellationToken*/).ContinueWith(_ => _defaultMeeting));

        // Act
        var cut = RenderComponent<MeetingDetailsPage>();

        // Assert
        cut.Markup.Should().Contain("""<span class="visually-hidden">Loading...</span>""");
    }

    [Fact]
    public void MeetingDetails_RendersCorrectly_WhenMeetingIsLoaded() {
        // Arrange
        _service.GetMeetingByIdAsync(Arg.Any<Guid>()).Returns(_defaultMeeting);

        // Act
        var cut = RenderComponent<MeetingDetailsPage>(ps => ps.Add(p => p.MeetingId, _meetingId));

        // Assert
        cut.Find("h1").TextContent.Should().Be("Meeting 1");
        cut.Find("button.btn-secondary").TextContent.Should().Be("Back to Meetings");
    }

    [Fact]
    public void MeetingDetails_ShowsEditButton_WhenUserIsGameMaster() {
        // Arrange
        _service.GetMeetingByIdAsync(Arg.Any<Guid>()).Returns(_defaultMeeting);

        // Act
        var cut = RenderComponent<MeetingDetailsPage>(ps => ps.Add(p => p.MeetingId, _meetingId));

        // Assert
        var editButton = cut.FindAll("button").FirstOrDefault(b => b.TextContent.Contains("Edit Meeting"));
        editButton.Should().NotBeNull();
    }

    [Fact]
    public void Clicking_BackToMeetings_NavigatesToMeetings() {
        // Arrange
        _service.GetMeetingByIdAsync(Arg.Any<Guid>()).Returns(_defaultMeeting);
        var cut = RenderComponent<MeetingDetailsPage>(ps => ps.Add(p => p.MeetingId, _meetingId));
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;

        // Act
        cut.Find("button.btn-secondary").Click();

        // Assert
        navigationSpy.History.Should().ContainSingle(x => x.Uri == "/meetings");
    }

    [Fact]
    public void Clicking_EditButton_ShowsEditDialog() {
        // Arrange
        _service.GetMeetingByIdAsync(Arg.Any<Guid>()).Returns(_defaultMeeting);
        var cut = RenderComponent<MeetingDetailsPage>(ps => ps.Add(p => p.MeetingId, _meetingId));

        // Act
        cut.FindAll("button").First(b => b.TextContent.Contains("Edit Meeting")).Click();

        // Assert
        cut.Find(".modal.show").Should().NotBeNull();
        cut.Instance.State.ShowEditDialog.Should().BeTrue();
        cut.Instance.State.Input.Subject.Should().Be("Meeting 1");
    }
}