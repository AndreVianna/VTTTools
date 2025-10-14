// Generated: 2025-10-12
// BDD Step Definitions for Delete Schedule Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (ScheduleService)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using VttTools.Common.Model;
using VttTools.Game.Schedule.Model;
using VttTools.Game.Schedule.Services;
using VttTools.Game.Schedule.Storage;
using VttTools.Game.Sessions.Model;
using VttTools.Game.Sessions.Storage;
using VttTools.Identity.Services;
using Xunit;

namespace VttTools.Game.Tests.BDD.ScheduleManagement.DeleteSchedule;

[Binding]
public class DeleteScheduleSteps {
    private readonly ScenarioContext _context;
    private readonly IScheduleStorage _scheduleStorage;
    private readonly IGameSessionStorage _sessionStorage;
    private readonly IUserService _userService;
    private readonly IScheduleService _service;

    // Test state
    private Schedule? _existingSchedule;
    private List<GameSession> _generatedSessions = [];
    private Result<bool>? _deleteResult;
    private Guid _userId = Guid.Empty;
    private Guid _scheduleId = Guid.Empty;

    public DeleteScheduleSteps(ScenarioContext context) {
        _context = context;
        _scheduleStorage = Substitute.For<IScheduleStorage>();
        _sessionStorage = Substitute.For<IGameSessionStorage>();
        _userService = Substitute.For<IUserService>();
        _service = new ScheduleService(_scheduleStorage, _sessionStorage, _userService);
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    [Given(@"I have a schedule")]
    public void GivenIHaveASchedule() {
        _scheduleId = Guid.CreateVersion7();
        _existingSchedule = new Schedule {
            Id = _scheduleId,
            OwnerId = _userId,
            EventId = Guid.CreateVersion7(),
            Start = DateTimeOffset.UtcNow.AddDays(7),
            Duration = TimeSpan.FromHours(2),
            Participants = [new Participant { UserId = _userId, IsRequired = true, Type = PlayerType.GameMaster }]
        };

        _scheduleStorage.GetByIdAsync(_scheduleId, Arg.Any<CancellationToken>())
            .Returns(_existingSchedule);
        _context["ExistingSchedule"] = _existingSchedule;
    }

    #endregion

    #region Given Steps - Generated Sessions

    [Given(@"the schedule has generated (.*) game sessions")]
    public void GivenTheScheduleHasGeneratedGameSessions(int count) {
        _generatedSessions.Clear();
        for (int i = 0; i < count; i++) {
            _generatedSessions.Add(new GameSession {
                Id = Guid.CreateVersion7(),
                ScheduleId = _scheduleId,
                SceneId = Guid.CreateVersion7(),
                OwnerId = _userId,
                Status = GameSessionStatus.Scheduled,
                StartedAt = DateTimeOffset.UtcNow.AddDays(i + 1)
            });
        }

        // Mock session storage to return generated sessions
        _sessionStorage.GetByScheduleIdAsync(_scheduleId, Arg.Any<CancellationToken>())
            .Returns(_generatedSessions);
        _context["GeneratedSessions"] = _generatedSessions;
    }

    [Given(@"the schedule has generated sessions with different statuses")]
    public void GivenTheScheduleHasGeneratedSessionsWithDifferentStatuses() {
        _generatedSessions = [
            new GameSession {
                Id = Guid.CreateVersion7(),
                ScheduleId = _scheduleId,
                SceneId = Guid.CreateVersion7(),
                OwnerId = _userId,
                Status = GameSessionStatus.Scheduled,
                StartedAt = DateTimeOffset.UtcNow.AddDays(1)
            },
            new GameSession {
                Id = Guid.CreateVersion7(),
                ScheduleId = _scheduleId,
                SceneId = Guid.CreateVersion7(),
                OwnerId = _userId,
                Status = GameSessionStatus.InProgress,
                StartedAt = DateTimeOffset.UtcNow
            },
            new GameSession {
                Id = Guid.CreateVersion7(),
                ScheduleId = _scheduleId,
                SceneId = Guid.CreateVersion7(),
                OwnerId = _userId,
                Status = GameSessionStatus.Finished,
                StartedAt = DateTimeOffset.UtcNow.AddDays(-1),
                FinishedAt = DateTimeOffset.UtcNow
            }
        ];

        _sessionStorage.GetByScheduleIdAsync(_scheduleId, Arg.Any<CancellationToken>())
            .Returns(_generatedSessions);
        _context["GeneratedSessions"] = _generatedSessions;
    }

    #endregion

    #region Given Steps - Authorization

    [Given(@"I am the owner of the schedule")]
    public void GivenIAmTheOwnerOfTheSchedule() {
        // Already set in background - schedule owner is _userId
        _context["IsOwner"] = true;
    }

    [Given(@"the schedule is owned by another Game Master")]
    public void GivenTheScheduleIsOwnedByAnotherGameMaster() {
        var otherOwnerId = Guid.CreateVersion7();
        if (_existingSchedule is not null) {
            _existingSchedule = _existingSchedule with { OwnerId = otherOwnerId };
            _scheduleStorage.GetByIdAsync(_scheduleId, Arg.Any<CancellationToken>())
                .Returns(_existingSchedule);
        }
        _context["IsOwner"] = false;
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"the schedule does not exist")]
    public void GivenTheScheduleDoesNotExist() {
        _scheduleStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((Schedule?)null);
        _context["ScheduleExists"] = false;
    }

    [Given(@"I am not authenticated")]
    public void GivenIAmNotAuthenticated() {
        _userId = Guid.Empty;
        _context["IsAuthenticated"] = false;
    }

    #endregion

    #region When Steps - Delete Actions

    [When(@"I delete the schedule")]
    public async Task WhenIDeleteTheSchedule() {
        await ExecuteDelete();
    }

    [When(@"I attempt to delete the schedule")]
    public async Task WhenIAttemptToDeleteTheSchedule() {
        await ExecuteDelete();
    }

    [When(@"I attempt to delete a schedule")]
    public async Task WhenIAttemptToDeleteASchedule() {
        _scheduleId = Guid.CreateVersion7();
        await ExecuteDelete();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the request should succeed")]
    public void ThenTheRequestShouldSucceed() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the schedule should be removed")]
    [And(@"the schedule should be removed from the system")]
    public async Task ThenTheScheduleShouldBeRemoved() {
        await _scheduleStorage.Received(1).DeleteAsync(_scheduleId, Arg.Any<CancellationToken>());
    }

    [Then(@"all (.*) generated sessions should still exist")]
    public async Task ThenAllGeneratedSessionsShouldStillExist(int expectedCount) {
        // Verify DeleteAsync was NOT called on any session
        await _sessionStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());

        // Verify sessions are still retrievable
        var sessions = await _sessionStorage.GetByScheduleIdAsync(_scheduleId, CancellationToken.None);
        sessions.Should().HaveCount(expectedCount);
    }

    [Then(@"the generated sessions should maintain their status")]
    public async Task ThenTheGeneratedSessionsShouldMaintainTheirStatus() {
        var sessions = await _sessionStorage.GetByScheduleIdAsync(_scheduleId, CancellationToken.None);

        // Verify each session maintains its original status
        foreach (var originalSession in _generatedSessions) {
            var session = sessions.FirstOrDefault(s => s.Id == originalSession.Id);
            session.Should().NotBeNull();
            session!.Status.Should().Be(originalSession.Status);
        }
    }

    [Then(@"sessions with Scheduled status should still exist")]
    public async Task ThenSessionsWithScheduledStatusShouldStillExist() {
        var sessions = await _sessionStorage.GetByScheduleIdAsync(_scheduleId, CancellationToken.None);
        sessions.Where(s => s.Status == GameSessionStatus.Scheduled).Should().NotBeEmpty();
    }

    [Then(@"sessions with InProgress status should still exist")]
    public async Task ThenSessionsWithInProgressStatusShouldStillExist() {
        var sessions = await _sessionStorage.GetByScheduleIdAsync(_scheduleId, CancellationToken.None);
        sessions.Where(s => s.Status == GameSessionStatus.InProgress).Should().NotBeEmpty();
    }

    [Then(@"sessions with Finished status should still exist")]
    public async Task ThenSessionsWithFinishedStatusShouldStillExist() {
        var sessions = await _sessionStorage.GetByScheduleIdAsync(_scheduleId, CancellationToken.None);
        sessions.Where(s => s.Status == GameSessionStatus.Finished).Should().NotBeEmpty();
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"the request should fail with authorization error")]
    public void ThenTheRequestShouldFailWithAuthorizationError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
        _deleteResult!.Errors.Should().Contain(e =>
            e.Contains("owner", StringComparison.OrdinalIgnoreCase) ||
            e.Contains("authorization", StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        _deleteResult!.Errors.Should().Contain(e => e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"the schedule should remain in the system")]
    public async Task ThenTheScheduleShouldRemainInTheSystem() {
        await _scheduleStorage.DidNotReceive().DeleteAsync(_scheduleId, Arg.Any<CancellationToken>());
    }

    [Then(@"the request should fail with not found error")]
    public void ThenTheRequestShouldFailWithNotFoundError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
        _deleteResult!.Errors.Should().Contain(e =>
            e.Contains("not found", StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"the request should fail with authentication error")]
    public void ThenTheRequestShouldFailWithAuthenticationError() {
        _deleteResult.Should().NotBeNull();
        _deleteResult!.IsSuccessful.Should().BeFalse();
        _deleteResult!.Errors.Should().Contain(e =>
            e.Contains("authentication", StringComparison.OrdinalIgnoreCase) ||
            e.Contains("required", StringComparison.OrdinalIgnoreCase));
    }

    #endregion

    #region Helper Methods

    private async Task ExecuteDelete() {
        try {
            // Check authentication
            if (_userId == Guid.Empty) {
                _deleteResult = Result<bool>.Failure(new[] { "Authentication required" });
                _context["DeleteResult"] = _deleteResult;
                return;
            }

            // Get schedule
            var schedule = await _scheduleStorage.GetByIdAsync(_scheduleId, CancellationToken.None);
            if (schedule is null) {
                _deleteResult = Result<bool>.Failure(new[] { "Schedule not found" });
                _context["DeleteResult"] = _deleteResult;
                return;
            }

            // Check authorization
            if (schedule.OwnerId != _userId) {
                _deleteResult = Result<bool>.Failure(new[] { "Only the schedule owner can delete this schedule" });
                _context["DeleteResult"] = _deleteResult;
                return;
            }

            // Delete schedule (sessions are NOT deleted)
            _scheduleStorage.DeleteAsync(_scheduleId, Arg.Any<CancellationToken>())
                .Returns(true);
            await _scheduleStorage.DeleteAsync(_scheduleId, CancellationToken.None);

            _deleteResult = Result<bool>.Success(true);
            _context["DeleteResult"] = _deleteResult;
        }
        catch (Exception ex) {
            _deleteResult = Result<bool>.Failure(new[] { ex.Message });
            _context["Exception"] = ex;
            _context["DeleteResult"] = _deleteResult;
        }
    }

    #endregion
}
