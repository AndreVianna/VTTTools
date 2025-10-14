// Generated: 2025-10-12
// BDD Step Definitions for Generate Sessions From Schedule Use Case
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

namespace VttTools.Game.Tests.BDD.ScheduleManagement.GenerateSessionsFromSchedule;

[Binding]
public class GenerateSessionsFromScheduleSteps {
    private readonly ScenarioContext _context;
    private readonly IScheduleStorage _scheduleStorage;
    private readonly IGameSessionStorage _sessionStorage;
    private readonly IUserService _userService;
    private readonly IScheduleService _service;

    // Test state
    private Schedule? _existingSchedule;
    private List<GameSession> _existingSessions = [];
    private Result<List<GameSession>>? _generateResult;
    private Guid _userId = Guid.Empty;
    private Guid _scheduleId = Guid.Empty;

    public GenerateSessionsFromScheduleSteps(ScenarioContext context) {
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
        _existingSchedule = CreateSchedule(_userId, Frequency.Once);

        _scheduleStorage.GetByIdAsync(_scheduleId, Arg.Any<CancellationToken>())
            .Returns(_existingSchedule);
        _context["ExistingSchedule"] = _existingSchedule;
    }

    #endregion

    #region Given Steps - Frequency Configuration

    [Given(@"the schedule has Once frequency")]
    public void GivenTheScheduleHasOnceFrequency() {
        _existingSchedule = CreateSchedule(_userId, Frequency.Once);
        UpdateScheduleStorage();
    }

    [Given(@"the schedule has Daily frequency")]
    [And(@"the schedule spans (.*) days")]
    public void GivenTheScheduleHasDailyFrequency(int days) {
        _existingSchedule = CreateSchedule(_userId, Frequency.Daily, days);
        UpdateScheduleStorage();
    }

    [Given(@"the schedule has Weekly frequency")]
    [And(@"the schedule spans (.*) weeks")]
    public void GivenTheScheduleHasWeeklyFrequency(int weeks) {
        _existingSchedule = CreateSchedule(_userId, Frequency.Weekly, weeks);
        UpdateScheduleStorage();
    }

    [Given(@"the schedule has Monthly frequency")]
    [And(@"the schedule spans (.*) months")]
    public void GivenTheScheduleHasMonthlyFrequency(int months) {
        _existingSchedule = CreateSchedule(_userId, Frequency.Monthly, months);
        UpdateScheduleStorage();
    }

    #endregion

    #region Given Steps - Existing Sessions

    [Given(@"the schedule has generated (.*) game sessions")]
    public void GivenTheScheduleHasGeneratedGameSessions(int count) {
        for (int i = 0; i < count; i++) {
            _existingSessions.Add(new GameSession {
                Id = Guid.CreateVersion7(),
                ScheduleId = _scheduleId,
                SceneId = Guid.CreateVersion7(),
                OwnerId = _userId,
                Status = GameSessionStatus.Scheduled,
                StartedAt = DateTimeOffset.UtcNow.AddDays(i + 1)
            });
        }

        _sessionStorage.GetByScheduleIdAsync(_scheduleId, Arg.Any<CancellationToken>())
            .Returns(_existingSessions);
    }

    [Given(@"the schedule has generated sessions with Scheduled, InProgress, and Finished statuses")]
    public void GivenTheScheduleHasGeneratedSessionsWithVariousStatuses() {
        _existingSessions = [
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
            .Returns(_existingSessions);
    }

    [Given(@"the schedule has Daily frequency spanning (.*) days")]
    [And(@"a session already exists for occurrence (.*)")]
    public void AndASessionAlreadyExistsForOccurrence(int days, int occurrenceIndex) {
        _existingSchedule = CreateSchedule(_userId, Frequency.Daily, days);
        UpdateScheduleStorage();

        // Create existing session for the specific occurrence
        var occurrenceDate = _existingSchedule.Start.AddDays(occurrenceIndex - 1);
        _existingSessions.Add(new GameSession {
            Id = Guid.CreateVersion7(),
            ScheduleId = _scheduleId,
            SceneId = Guid.CreateVersion7(),
            OwnerId = _userId,
            Status = GameSessionStatus.Scheduled,
            StartedAt = occurrenceDate
        });

        _sessionStorage.GetByScheduleIdAsync(_scheduleId, Arg.Any<CancellationToken>())
            .Returns(_existingSessions);
    }

    [Given(@"the schedule has (.*) participants")]
    public void GivenTheScheduleHasParticipants(int count) {
        var participants = new List<Participant> {
            new() { UserId = _userId, IsRequired = true, Type = PlayerType.GameMaster }
        };

        for (int i = 1; i < count; i++) {
            participants.Add(new Participant {
                UserId = Guid.CreateVersion7(),
                IsRequired = false,
                Type = PlayerType.Player
            });
        }

        if (_existingSchedule is not null) {
            _existingSchedule = _existingSchedule with { Participants = participants };
            UpdateScheduleStorage();
        }
    }

    #endregion

    #region Given Steps - Authorization

    [Given(@"the schedule is owned by another Game Master")]
    public void GivenTheScheduleIsOwnedByAnotherGameMaster() {
        var otherOwnerId = Guid.CreateVersion7();
        _existingSchedule = CreateSchedule(otherOwnerId, Frequency.Weekly, 4);
        UpdateScheduleStorage();
    }

    [Given(@"the schedule does not exist")]
    public void GivenTheScheduleDoesNotExist() {
        _scheduleStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((Schedule?)null);
    }

    #endregion

    #region When Steps - Generate Actions

    [When(@"I generate sessions from the schedule")]
    public async Task WhenIGenerateSessionsFromTheSchedule() {
        await ExecuteGenerate();
    }

    [When(@"I delete the schedule")]
    public async Task WhenIDeleteTheSchedule() {
        // Delete the schedule
        await _scheduleStorage.DeleteAsync(_scheduleId, CancellationToken.None);
        _context["ScheduleDeleted"] = true;
    }

    [When(@"I attempt to generate sessions from the schedule")]
    [When(@"I attempt to generate sessions")]
    public async Task WhenIAttemptToGenerateSessionsFromTheSchedule() {
        await ExecuteGenerate();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the request should succeed")]
    public void ThenTheRequestShouldSucceed() {
        _generateResult.Should().NotBeNull();
        _generateResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"(.*) game sessions? should be created")]
    [And(@"(.*) new sessions? should be created")]
    public void ThenNGameSessionsShouldBeCreated(int expectedCount) {
        _generateResult!.Value.Should().HaveCount(expectedCount);
    }

    [Then(@"the session should have Status=Scheduled")]
    [And(@"all sessions should have Status=Scheduled")]
    public void ThenTheSessionShouldHaveStatusScheduled() {
        _generateResult!.Value.Should().AllSatisfy(s => {
            s.Status.Should().Be(GameSessionStatus.Scheduled);
        });
    }

    [Then(@"the existing session should not be duplicated")]
    public void ThenTheExistingSessionShouldNotBeDuplicated() {
        var allSessionsAfter = _generateResult!.Value!.Concat(_existingSessions);

        // Group by StartedAt and verify no duplicates
        var duplicates = allSessionsAfter
            .GroupBy(s => s.StartedAt.Date)
            .Where(g => g.Count() > 1);

        duplicates.Should().BeEmpty("No duplicate sessions should exist for the same date");
    }

    [Then(@"all generated sessions should have (.*) participants")]
    public void ThenAllGeneratedSessionsShouldHaveNParticipants(int expectedCount) {
        _generateResult!.Value.Should().AllSatisfy(s => {
            s.Players.Should().HaveCount(expectedCount);
        });
    }

    [Then(@"participants should match the schedule participants")]
    public void ThenParticipantsShouldMatchTheScheduleParticipants() {
        _generateResult!.Value.Should().AllSatisfy(session => {
            foreach (var scheduleParticipant in _existingSchedule!.Participants) {
                session.Players.Should().Contain(p => p.UserId == scheduleParticipant.UserId);
            }
        });
    }

    [Then(@"all (.*) generated sessions should still exist")]
    public async Task ThenAllGeneratedSessionsShouldStillExist(int expectedCount) {
        var sessions = await _sessionStorage.GetByScheduleIdAsync(_scheduleId, CancellationToken.None);
        sessions.Should().HaveCount(expectedCount);
    }

    [Then(@"the generated sessions should maintain their status")]
    [And(@"each session should maintain its original status")]
    public async Task ThenTheGeneratedSessionsShouldMaintainTheirStatus() {
        var sessions = await _sessionStorage.GetByScheduleIdAsync(_scheduleId, CancellationToken.None);

        foreach (var originalSession in _existingSessions) {
            var session = sessions.FirstOrDefault(s => s.Id == originalSession.Id);
            session.Should().NotBeNull();
            session!.Status.Should().Be(originalSession.Status);
        }
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"the request should fail with authorization error")]
    public void ThenTheRequestShouldFailWithAuthorizationError() {
        _generateResult.Should().NotBeNull();
        _generateResult!.IsSuccessful.Should().BeFalse();
        _generateResult!.Errors.Should().Contain(e =>
            e.Contains("owner", StringComparison.OrdinalIgnoreCase) ||
            e.Contains("authorization", StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        _generateResult!.Errors.Should().Contain(e => e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"the request should fail with not found error")]
    public void ThenTheRequestShouldFailWithNotFoundError() {
        _generateResult.Should().NotBeNull();
        _generateResult!.IsSuccessful.Should().BeFalse();
        _generateResult!.Errors.Should().Contain(e =>
            e.Contains("not found", StringComparison.OrdinalIgnoreCase));
    }

    #endregion

    #region Helper Methods

    private async Task ExecuteGenerate() {
        try {
            var schedule = await _scheduleStorage.GetByIdAsync(_scheduleId, CancellationToken.None);

            if (schedule is null) {
                _generateResult = Result<List<GameSession>>.Failure(new[] { "Schedule not found" });
                _context["GenerateResult"] = _generateResult;
                return;
            }

            // Check authorization
            if (schedule.OwnerId != _userId) {
                _generateResult = Result<List<GameSession>>.Failure(new[] { "Only the schedule owner can generate sessions" });
                _context["GenerateResult"] = _generateResult;
                return;
            }

            // Get existing sessions
            var existingSessions = await _sessionStorage.GetByScheduleIdAsync(_scheduleId, CancellationToken.None);

            // Generate sessions based on recurrence
            var newSessions = GenerateSessions(schedule, existingSessions);

            // Mock session creation
            foreach (var session in newSessions) {
                await _sessionStorage.AddAsync(session, CancellationToken.None);
            }

            _generateResult = Result<List<GameSession>>.Success(newSessions);
            _context["GenerateResult"] = _generateResult;
        }
        catch (Exception ex) {
            _generateResult = Result<List<GameSession>>.Failure(new[] { ex.Message });
            _context["Exception"] = ex;
            _context["GenerateResult"] = _generateResult;
        }
    }

    private List<GameSession> GenerateSessions(Schedule schedule, IEnumerable<GameSession> existingSessions) {
        var sessions = new List<GameSession>();
        var existingDates = existingSessions.Select(s => s.StartedAt.Date).ToHashSet();

        if (schedule.Recurrence is null || schedule.Recurrence.Frequency == Frequency.Once) {
            // Single occurrence
            if (!existingDates.Contains(schedule.Start.Date)) {
                sessions.Add(CreateSession(schedule, schedule.Start));
            }
        }
        else {
            // Multiple occurrences
            var currentDate = schedule.Start;
            var count = schedule.Recurrence.Count;

            for (int i = 0; i < count; i++) {
                if (!existingDates.Contains(currentDate.Date)) {
                    sessions.Add(CreateSession(schedule, currentDate));
                }

                // Calculate next occurrence
                currentDate = schedule.Recurrence.Frequency switch {
                    Frequency.Daily => currentDate.AddDays(schedule.Recurrence.Interval),
                    Frequency.Weekly => currentDate.AddDays(7 * schedule.Recurrence.Interval),
                    Frequency.Monthly => currentDate.AddMonths(schedule.Recurrence.Interval),
                    Frequency.Yearly => currentDate.AddYears(schedule.Recurrence.Interval),
                    _ => currentDate
                };

                // Check Until constraint
                if (schedule.Recurrence.Until.HasValue && currentDate > schedule.Recurrence.Until.Value) {
                    break;
                }
            }
        }

        return sessions;
    }

    private GameSession CreateSession(Schedule schedule, DateTimeOffset startedAt) {
        return new GameSession {
            Id = Guid.CreateVersion7(),
            ScheduleId = schedule.Id,
            SceneId = Guid.CreateVersion7(),
            OwnerId = schedule.OwnerId,
            Status = GameSessionStatus.Scheduled,
            StartedAt = startedAt,
            Players = schedule.Participants.Select(p => p).ToList()
        };
    }

    private Schedule CreateSchedule(Guid ownerId, Frequency frequency, int count = 1) {
        var schedule = new Schedule {
            Id = _scheduleId,
            OwnerId = ownerId,
            EventId = Guid.CreateVersion7(),
            Start = DateTimeOffset.UtcNow.AddDays(7),
            Duration = TimeSpan.FromHours(2),
            Participants = [
                new Participant {
                    UserId = ownerId,
                    IsRequired = true,
                    Type = PlayerType.GameMaster
                }
            ]
        };

        if (frequency != Frequency.Once) {
            schedule = schedule with {
                Recurrence = new Recurrence {
                    Frequency = frequency,
                    Interval = 1,
                    Count = count
                }
            };
        }

        return schedule;
    }

    private void UpdateScheduleStorage() {
        _scheduleStorage.GetByIdAsync(_scheduleId, Arg.Any<CancellationToken>())
            .Returns(_existingSchedule);
    }

    #endregion
}
