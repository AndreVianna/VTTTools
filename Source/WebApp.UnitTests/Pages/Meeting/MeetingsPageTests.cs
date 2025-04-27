namespace VttTools.WebApp.Pages.Meeting;

public class MeetingsPageTests : WebAppTestContext {
    private readonly IGameService _service = Substitute.For<IGameService>();
    private readonly MeetingModel[] _defaultMeetings = [
            new() {
                Id = Guid.NewGuid(),
                Subject = "Meeting 1",
                OwnerId = Guid.NewGuid(),
            },
            new() {
                Id = Guid.NewGuid(),
                Subject = "Meeting 2",
                OwnerId = Guid.NewGuid(),
            }];

    public MeetingsPageTests() {
        Services.AddScoped<IGameService>(_ => _service);
        UseDefaultUser();
    }

    [Fact]
    public void RendersLoadingState_WhenStateIsNull() {
        // Arrange
        _service.GetMeetingsAsync().Returns(Task.Delay(1000).ContinueWith(_ => _defaultMeetings));

        // Act
        var cut = RenderComponent<MeetingsPage>();

        // Assert
        cut.Markup.Should().Contain("""<span class="visually-hidden">Loading...</span>""");
    }

    //[Fact]
    //public void Meetings_RendersEmptyState_WhenNoMeetingsExist() {
    //    // Arrange
    //    var meetings = Array.Empty<MeetingModel>();
    //    _httpClient.GetFromJsonAsync<MeetingModel[]>("/api/meetings").Returns(meetings);

    //    // Act
    //    var cut = RenderComponent<MeetingsPage>();

    //    // Set state manually
    //    cut.Instance.State = new() { Meetings = [] };
    //    cut.SetParametersAndRender();

    //    // Assert
    //    cut.Find(".alert-info").TextContent.Should().Contain("You don't have any game meetings yet");
    //}

    //[Fact]
    //public void Meetings_RendersMeetingsList_WhenStateHasMeetings() {
    //    // Arrange
    //    var currentUserId = Guid.NewGuid();
    //    var meetings = new List<MeetingModel> {
    //        new() {
    //            Id = Guid.NewGuid(),
    //            Subject = "Meeting 1",
    //            OwnerId = currentUserId,
    //            Players = new List<MeetingPlayer>(),
    //              },
    //        new() {
    //            Id = Guid.NewGuid(),
    //            Subject = "Meeting 2",
    //            OwnerId = Guid.NewGuid(),
    //            Players = new List<MeetingPlayer>(),
    //              },
    //                                          };

    //    // Act
    //    var cut = RenderComponent<MeetingsPage>();

    //    // Set state and current user manually
    //    cut.Instance.State = new() { Meetings = meetings };
    //    cut.Instance.CurrentUser.Id = currentUserId;
    //    cut.SetParametersAndRender();

    //    // Assert
    //    var cards = cut.FindAll(".card");
    //    cards.Count.Should().Be(2);

    //    cards[0].QuerySelector(".card-title").TextContent.Should().Be("Meeting 1");
    //    cards[1].QuerySelector(".card-title").TextContent.Should().Be("Meeting 2");

    //    // Owner should have delete button
    //    var deleteButtons = cards[0].QuerySelectorAll(".btn-outline-danger");
    //    deleteButtons.Count.Should().Be(1);

    //    // Non-owner should not have delete button
    //    var deleteButtons2 = cards[1].QuerySelectorAll(".btn-outline-danger");
    //    deleteButtons2.Count.Should().Be(0);
    //}

    //[Fact]
    //public void Clicking_CreateButton_OpensCreateDialog() {
    //    // Arrange
    //    var adventures = new Adventure[] {
    //        new() { Id = Guid.NewGuid(), Name = "Adventure 1" },
    //                                     };

    //    _httpClient.GetFromJsonAsync<Adventure[]>("/api/adventures").Returns(adventures);

    //    // Act
    //    var cut = RenderComponent<MeetingsPage>();

    //    // Set state manually
    //    cut.Instance.State = new() { Meetings = [] };
    //    cut.SetParametersAndRender();

    //    // Click create button
    //    var createButton = cut.Find("button.btn-primary");
    //    createButton.Click();

    //    // Assert
    //    cut.Find(".modal.show").Should().NotBeNull();
    //    cut.Instance.State.ShowCreateDialog.Should().BeTrue();
    //}

    //[Fact]
    //public void Clicking_JoinButton_NavigatesToGame() {
    //    // Arrange
    //    var meetingId = Guid.NewGuid();
    //    var meetings = new List<MeetingModel> {
    //        new() { Id = meetingId, Subject = "Meeting to Join", Players = [] },
    //                                          };

    //    // Setup successful join
    //    var successResponse = new HttpResponseMessage(HttpStatusCode.OK);
    //    _httpClient.PostAsync($"/api/meetings/{meetingId}/join", null).Returns(successResponse);

    //    // Act
    //    var cut = RenderComponent<MeetingsPage>();

    //    // Set state manually
    //    cut.Instance.State = new() { Meetings = meetings };
    //    cut.SetParametersAndRender();

    //    // Click join button
    //    var joinButton = cut.FindAll("button.btn-primary").First(b => b.TextContent == "Join");

    //    // Record expected navigation
    //    _navigationInterceptor.ExpectedNavigationTarget = $"/game/{meetingId}";

    //    joinButton.Click();

    //    // Assert
    //    _navigationInterceptor.WasNavigatedTo.Should().BeTrue();
    //}

    //[Fact]
    //public void Clicking_EditButton_NavigatesToMeetingDetails() {
    //    // Arrange
    //    var meetingId = Guid.NewGuid();
    //    var meetings = new List<MeetingModel> {
    //        new() { Id = meetingId, Subject = "Meeting to Edit", Players = [] },
    //                                          };

    //    // Act
    //    var cut = RenderComponent<MeetingsPage>();

    //    // Set state manually
    //    cut.Instance.State = new() { Meetings = meetings };
    //    cut.SetParametersAndRender();

    //    // Click edit button
    //    var editButton = cut.FindAll("button.btn-primary").First(b => b.TextContent == "Edit");

    //    // Record expected navigation
    //    _navigationInterceptor.ExpectedNavigationTarget = $"/meeting/{meetingId}";

    //    editButton.Click();

    //    // Assert
    //    _navigationInterceptor.WasNavigatedTo.Should().BeTrue();
    //}

    //private class TestNavigationInterceptor {
    //    public string? ExpectedNavigationTarget { get; set; }
    //    public bool WasNavigatedTo { get; private set; }

    //    // Use LocationChanged instead of NavigationRequested
    //    public void Init(NavigationManager navigationManager) {
    //        navigationManager.LocationChanged += OnLocationChanged;
    //    }

    //    private void OnLocationChanged(object? sender, LocationChangedEventArgs e) {
    //        if (e.Location == ExpectedNavigationTarget) {
    //            WasNavigatedTo = true;
    //        }
    //    }
    //}
}