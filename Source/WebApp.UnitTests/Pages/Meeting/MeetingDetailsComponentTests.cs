//using MeetingModel = VttTools.Model.Game.Meeting;

namespace VttTools.WebApp.Pages.Meeting;

//public class MeetingDetailsComponentTests : Bunit.TestContext {
//    private readonly GameService _gameServiceClient = Substitute.For<GameService>();
//    private readonly HttpClient _httpClient = Substitute.For<HttpClient>();
//    private readonly NavigationManager _navigationManager;
//    private readonly Guid _meetingId = Guid.NewGuid();
//    private readonly TestNavigationInterceptor _navigationInterceptor;

//    public MeetingDetailsComponentTests() {
//        _gameServiceClient.Api.Returns(_httpClient);

//        // Set up navigation
//        _navigationManager = Services.GetRequiredService<NavigationManager>();
//        _navigationInterceptor = new(_navigationManager);
//        Services.AddSingleton<GameService>(_gameServiceClient);
//    }

//    [Fact]
//    public void MeetingDetails_RendersLoadingState_WhenMeetingIsNull() {
//        // Arrange
//        _httpClient.GetFromJsonAsync<MeetingModel>($"/api/meetings/{_meetingId}")
//            .Returns(Task.FromResult<MeetingModel>(null!));

//        // Act
//        var cut = RenderComponent<MeetingDetailsPage>(parameters =>
//            parameters.Add(p => p.MeetingId, _meetingId));

//        // Initially the component will show loading
//        var spinner = cut.Find(".spinner-border");
//        spinner.Should().NotBeNull();
//    }

//    [Fact]
//    public void MeetingDetails_RendersCorrectly_WhenMeetingIsLoaded() {
//        // Arrange
//        var meeting = new MeetingModel {
//            Id = _meetingId,
//            Subject = "Test Meeting",
//            OwnerId = Guid.NewGuid(),
//            Players = new List<MeetingPlayer>(),
//                                       };

//        _httpClient.GetFromJsonAsync<MeetingModel>($"/api/meetings/{_meetingId}")
//            .Returns(meeting);

//        // Act
//        var cut = RenderComponent<MeetingDetailsPage>(parameters =>
//            parameters.Add(p => p.MeetingId, _meetingId));

//        // Set state manually since we can't wait for the async operation
//        cut.Instance.State.Meeting = meeting;
//        cut.SetParametersAndRender();

//        // Assert
//        cut.Find("h1").TextContent.Should().Be("Test Meeting");
//        cut.Find("button.btn-secondary").TextContent.Should().Be("Back to Meetings");
//    }

//    [Fact]
//    public void MeetingDetails_ShowsEditButton_WhenUserIsGameMaster() {
//        // Arrange
//        var meeting = new MeetingModel {
//            Id = _meetingId,
//            Subject = "Test Meeting",
//            OwnerId = Guid.NewGuid(),
//            Players = new List<MeetingPlayer>(),
//                                       };

//        _httpClient.GetFromJsonAsync<MeetingModel>($"/api/meetings/{_meetingId}")
//            .Returns(meeting);

//        // Act
//        var cut = RenderComponent<MeetingDetailsPage>(parameters =>
//            parameters.Add(p => p.MeetingId, _meetingId));

//        // Set state manually
//        cut.Instance.State.Meeting = meeting;
//        cut.Instance.State.IsGameMaster = true;
//        cut.SetParametersAndRender();

//        // Assert
//        var editButton = cut.FindAll("button").FirstOrDefault(b => b.TextContent.Contains("Edit Meeting"));
//        editButton.Should().NotBeNull();
//    }

//    [Fact]
//    public void Clicking_BackToMeetings_NavigatesToMeetings() {
//        // Arrange
//        var meeting = new MeetingModel {
//            Id = _meetingId,
//            Subject = "Test Meeting",
//            OwnerId = Guid.NewGuid(),
//            Players = new List<MeetingPlayer>(),
//                                       };

//        _httpClient.GetFromJsonAsync<MeetingModel>($"/api/meetings/{_meetingId}")
//            .Returns(meeting);

//        // Act
//        var cut = RenderComponent<MeetingDetailsPage>(parameters =>
//            parameters.Add(p => p.MeetingId, _meetingId));

//        // Set state manually
//        cut.Instance.State.Meeting = meeting;
//        cut.SetParametersAndRender();

//        // Record navigation target
//        _navigationInterceptor.ExpectedNavigationTarget = "/meetings";

//        // Click back button
//        var backButton = cut.Find("button.btn-secondary");
//        backButton.Click();
//    }

//    [Fact]
//    public void Clicking_EditButton_ShowsEditDialog() {
//        // Arrange
//        var meeting = new MeetingModel {
//            Id = _meetingId,
//            Subject = "Test Meeting",
//            OwnerId = Guid.NewGuid(),
//            Players = new List<MeetingPlayer>(),
//                                       };

//        _httpClient.GetFromJsonAsync<MeetingModel>($"/api/meetings/{_meetingId}")
//            .Returns(meeting);

//        // Act
//        var cut = RenderComponent<MeetingDetailsPage>(parameters =>
//            parameters.Add(p => p.MeetingId, _meetingId));

//        // Set state manually
//        cut.Instance.State.Meeting = meeting;
//        cut.Instance.State.IsGameMaster = true;
//        cut.SetParametersAndRender();

//        // Click edit button
//        var editButton = cut.FindAll("button").First(b => b.TextContent.Contains("Edit Meeting"));
//        editButton.Click();

//        // Assert
//        cut.Find(".modal.show").Should().NotBeNull();
//        cut.Instance.State.ShowEditDialog.Should().BeTrue();
//        cut.Instance.State.EditMeetingSubject.Should().Be("Test Meeting");
//    }
//}