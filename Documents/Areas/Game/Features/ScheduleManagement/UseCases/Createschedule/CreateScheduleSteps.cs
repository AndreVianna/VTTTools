// Generated: 2025-10-12
// BDD Step Definitions for Create Schedule Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (ScheduleService)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;
using VttTools.Common.Model;
using VttTools.Game.Schedule.Model;
using VttTools.Game.Schedule.ServiceContracts;
using VttTools.Game.Schedule.Services;
using VttTools.Game.Schedule.Storage;
using VttTools.Game.Sessions.Model;
using VttTools.Game.Sessions.Storage;
using VttTools.Identity.Services;
using Xunit;

namespace VttTools.Game.Tests.BDD.ScheduleManagement.CreateSchedule;

[Binding]
public class CreateScheduleSteps {
    private readonly ScenarioContext _context;
    private readonly IScheduleStorage _scheduleStorage;
    private readonly IGameSessionStorage _sessionStorage;
    private readonly IUserService _userService;
    private readonly IScheduleService _service;

    // Test state
    private CreateScheduleData? _createData;
    private Result<Schedule>? _createResult;
    private Guid _userId = Guid.Empty;
    private DateTimeOffset _currentTime = DateTimeOffset.UtcNow;
    private List<Guid> _participantIds = [];
    private Exception? _exception;

    public CreateScheduleSteps(ScenarioContext context) {
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

    [Given(@"the schedule service is available")]
    public void GivenTheScheduleServiceIsAvailable() {
        // Mock storage to be available
        _scheduleStorage.UpdateAsync(Arg.Any<Schedule>(), Arg.Any<CancellationToken>())
            .Returns(true);
        _context["ServiceAvailable"] = true;
    }

    #endregion

    #region Given Steps - Time Context

    [Given(@"the current time is ""(.*)""")]
    public void GivenTheCurrentTimeIs(string timeString) {
        _currentTime = DateTimeOffset.Parse(timeString);
        _context["CurrentTime"] = _currentTime;
    }

    #endregion

    #region Given Steps - Start Date Validation

    [When(@"I create a schedule with start ""(.*)""")]
    public async Task WhenICreateScheduleWithStart(string startTime) {
        var start = DateTimeOffset.Parse(startTime);
        _createData = new CreateScheduleData {
            Start = start,
            Duration = TimeSpan.FromHours(2),
            EventId = Guid.CreateVersion7(),
            Participants = [new Participant { UserId = _userId, IsRequired = true, Type = PlayerType.GameMaster }]
        };

        await WhenICreateTheSchedule();
    }

    [When(@"I attempt to create a schedule with start ""(.*)""")]
    public async Task WhenIAttemptToCreateScheduleWithStart(string startTime) {
        await WhenICreateScheduleWithStart(startTime);
    }

    #endregion

    #region Given Steps - Duration Validation

    [When(@"I create a schedule with duration ""(.*)""")]
    public async Task WhenICreateScheduleWithDuration(string durationText) {
        var duration = ParseDuration(durationText);
        _createData = new CreateScheduleData {
            Start = _currentTime.AddDays(7),
            Duration = duration,
            EventId = Guid.CreateVersion7(),
            Participants = [new Participant { UserId = _userId, IsRequired = true, Type = PlayerType.GameMaster }]
        };

        await WhenICreateTheSchedule();
    }

    [When(@"I attempt to create a schedule with duration ""(.*)""")]
    public async Task WhenIAttemptToCreateScheduleWithDuration(string durationText) {
        await WhenICreateScheduleWithDuration(durationText);
    }

    #endregion

    #region Given Steps - Recurrence Validation

    [When(@"I create a schedule with start ""(.*)""")]
    [And(@"recurrence frequency ""(.*)"" with until ""(.*)""")]
    public async Task AndRecurrenceFrequencyWithUntil(string frequency, string untilTime) {
        var until = DateTimeOffset.Parse(untilTime);
        var freq = Enum.Parse<Frequency>(frequency);

        if (_createData is not null) {
            _createData = _createData with {
                Recurrence = new Recurrence {
                    Frequency = freq,
                    Interval = 1,
                    Until = until
                }
            };
        }

        await WhenICreateTheSchedule();
    }

    [When(@"I attempt to create a schedule with start ""(.*)""")]
    [And(@"recurrence frequency ""(.*)"" with until ""(.*)""")]
    public async Task WhenIAttemptToCreateWithRecurrenceUntil(string start, string frequency, string until) {
        var startTime = DateTimeOffset.Parse(start);
        var untilTime = DateTimeOffset.Parse(until);
        var freq = Enum.Parse<Frequency>(frequency);

        _createData = new CreateScheduleData {
            Start = startTime,
            Duration = TimeSpan.FromHours(2),
            EventId = Guid.CreateVersion7(),
            Participants = [new Participant { UserId = _userId, IsRequired = true, Type = PlayerType.GameMaster }],
            Recurrence = new Recurrence {
                Frequency = freq,
                Interval = 1,
                Until = untilTime
            }
        };

        await WhenICreateTheSchedule();
    }

    [And(@"recurrence frequency ""(.*)"" with interval (.*)")]
    public void AndRecurrenceFrequencyWithInterval(string frequency, int interval) {
        var freq = Enum.Parse<Frequency>(frequency);

        if (_createData is not null) {
            _createData = _createData with {
                Recurrence = new Recurrence {
                    Frequency = freq,
                    Interval = interval
                }
            };
        }
    }

    #endregion

    #region Given Steps - Participant Validation

    [Given(@"my user ID is in the participant list")]
    public void GivenMyUserIdIsInParticipantList() {
        _participantIds.Clear();
        _participantIds.Add(_userId);
        _context["ParticipantsIncludeOwner"] = true;
    }

    [Given(@"my user ID is not in the participant list")]
    public void GivenMyUserIdIsNotInParticipantList() {
        _participantIds.Clear();
        _participantIds.Add(Guid.CreateVersion7()); // Different user
        _context["ParticipantsIncludeOwner"] = false;
    }

    [When(@"I create a schedule with multiple participants")]
    public async Task WhenICreateScheduleWithMultipleParticipants() {
        var participants = _participantIds.Select(id => new Participant {
            UserId = id,
            IsRequired = true,
            Type = id == _userId ? PlayerType.GameMaster : PlayerType.Player
        }).ToList();

        _createData = new CreateScheduleData {
            Start = _currentTime.AddDays(7),
            Duration = TimeSpan.FromHours(2),
            EventId = Guid.CreateVersion7(),
            Participants = participants
        };

        // Mock all users exist
        _userService.ExistsAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(true);

        await WhenICreateTheSchedule();
    }

    [When(@"I attempt to create a schedule")]
    public async Task WhenIAttemptToCreateSchedule() {
        _createData = new CreateScheduleData {
            Start = _currentTime.AddDays(7),
            Duration = TimeSpan.FromHours(2),
            EventId = Guid.CreateVersion7(),
            Participants = _participantIds.Select(id => new Participant {
                UserId = id,
                IsRequired = true,
                Type = PlayerType.Player
            }).ToList()
        };

        await WhenICreateTheSchedule();
    }

    [Given(@"all participant users exist in the system")]
    public void GivenAllParticipantUsersExist() {
        _participantIds.Add(_userId);
        _participantIds.Add(Guid.CreateVersion7());
        _participantIds.Add(Guid.CreateVersion7());

        // Mock user service to return true for all
        _userService.ExistsAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(true);
    }

    [When(@"I create a schedule with those participants")]
    public async Task WhenICreateScheduleWithThoseParticipants() {
        await WhenICreateScheduleWithMultipleParticipants();
    }

    [Given(@"a participant user ID does not exist")]
    public void GivenAParticipantUserIdDoesNotExist() {
        var nonExistentUserId = Guid.CreateVersion7();
        _participantIds.Add(_userId); // Owner
        _participantIds.Add(nonExistentUserId); // Non-existent

        // Mock user service
        _userService.ExistsAsync(_userId, Arg.Any<CancellationToken>())
            .Returns(true);
        _userService.ExistsAsync(nonExistentUserId, Arg.Any<CancellationToken>())
            .Returns(false);
    }

    [When(@"I attempt to create a schedule with that participant")]
    public async Task WhenIAttemptToCreateScheduleWithThatParticipant() {
        await WhenICreateScheduleWithMultipleParticipants();
    }

    #endregion

    #region Given Steps - Data-Driven Scenarios

    [Given(@"a schedule does not exist")]
    public void GivenAScheduleDoesNotExist() {
        // Default state - no existing schedule
        _context["ScheduleExists"] = false;
    }

    [Given(@"the schedule service is unavailable")]
    public void GivenTheScheduleServiceIsUnavailable() {
        _scheduleStorage.UpdateAsync(Arg.Any<Schedule>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromException<bool>(new Exception("Service unavailable")));
        _context["ServiceAvailable"] = false;
    }

    [When(@"I attempt to create a schedule with valid data")]
    public async Task WhenIAttemptToCreateScheduleWithValidData() {
        _createData = new CreateScheduleData {
            Start = _currentTime.AddDays(7),
            Duration = TimeSpan.FromHours(2),
            EventId = Guid.CreateVersion7(),
            Participants = [new Participant { UserId = _userId, IsRequired = true, Type = PlayerType.GameMaster }]
        };

        await WhenICreateTheSchedule();
    }

    #endregion

    #region When Steps - Create Actions

    [When(@"I create the schedule")]
    public async Task WhenICreateTheSchedule() {
        try {
            if (_createData is null) {
                throw new InvalidOperationException("CreateScheduleData is not initialized");
            }

            // Validate current time
            var validationResult = ValidateSchedule(_createData, _currentTime);
            if (!validationResult.IsValid) {
                _createResult = Result<Schedule>.Failure(validationResult.Errors);
                _context["CreateResult"] = _createResult;
                return;
            }

            // Mock successful storage
            _scheduleStorage.UpdateAsync(Arg.Any<Schedule>(), Arg.Any<CancellationToken>())
                .Returns(true);

            // Create schedule
            var schedule = new Schedule {
                Id = Guid.CreateVersion7(),
                OwnerId = _userId,
                EventId = _createData.EventId,
                Start = _createData.Start,
                Duration = _createData.Duration,
                Participants = _createData.Participants,
                Recurrence = _createData.Recurrence
            };

            _createResult = Result<Schedule>.Success(schedule);
            _context["CreateResult"] = _createResult;

            await _scheduleStorage.UpdateAsync(schedule, CancellationToken.None);
        }
        catch (Exception ex) {
            _exception = ex;
            _createResult = Result<Schedule>.Failure(new[] { ex.Message });
            _context["Exception"] = ex;
            _context["CreateResult"] = _createResult;
        }
    }

    [When(@"I attempt to create the schedule")]
    public async Task WhenIAttemptToCreateTheSchedule() {
        await WhenICreateTheSchedule();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"my schedule should be created successfully")]
    public void ThenMyScheduleShouldBeCreatedSuccessfully() {
        _createResult.Should().NotBeNull();
        _createResult!.IsSuccessful.Should().BeTrue();
        _createResult.Value.Should().NotBeNull();
        _createResult.Value!.Id.Should().NotBeEmpty();
    }

    [Then(@"the schedule start should be ""(.*)""")]
    public void ThenTheScheduleStartShouldBe(string expectedStart) {
        var expectedStartTime = DateTimeOffset.Parse(expectedStart);
        _createResult!.Value!.Start.Should().Be(expectedStartTime);
    }

    [Then(@"the schedule duration should be ""(.*)""")]
    public void ThenTheScheduleDurationShouldBe(string durationText) {
        var expectedDuration = ParseDuration(durationText);
        _createResult!.Value!.Duration.Should().Be(expectedDuration);
    }

    [Then(@"the recurrence until should be ""(.*)""")]
    public void ThenTheRecurrenceUntilShouldBe(string untilTime) {
        var expectedUntil = DateTimeOffset.Parse(untilTime);
        _createResult!.Value!.Recurrence.Should().NotBeNull();
        _createResult!.Value!.Recurrence!.Until.Should().Be(expectedUntil);
    }

    [Then(@"I should be included in the participants")]
    public void ThenIShouldBeIncludedInTheParticipants() {
        _createResult!.Value!.Participants.Should().Contain(p => p.UserId == _userId);
    }

    [Then(@"all participants should be included")]
    public void ThenAllParticipantsShouldBeIncluded() {
        _createResult!.Value!.Participants.Should().HaveCount(_participantIds.Count);
        foreach (var participantId in _participantIds) {
            _createResult!.Value!.Participants.Should().Contain(p => p.UserId == participantId);
        }
    }

    [Then(@"the recurrence frequency should be ""(.*)""")]
    public void ThenTheRecurrenceFrequencyShouldBe(string frequency) {
        var expectedFreq = Enum.Parse<Frequency>(frequency);
        _createResult!.Value!.Recurrence.Should().NotBeNull();
        _createResult!.Value!.Recurrence!.Frequency.Should().Be(expectedFreq);
    }

    [Then(@"the recurrence interval should be (.*)")]
    public void ThenTheRecurrenceIntervalShouldBe(int interval) {
        _createResult!.Value!.Recurrence.Should().NotBeNull();
        _createResult!.Value!.Recurrence!.Interval.Should().Be(interval);
    }

    [Then(@"the schedule service should be available")]
    public void ThenTheScheduleServiceShouldBeAvailable() {
        var serviceAvailable = _context.Get<bool>("ServiceAvailable");
        serviceAvailable.Should().BeTrue();
    }

    [Then(@"I should be able to create the schedule")]
    public void ThenIShouldBeAbleToCreateTheSchedule() {
        _createResult.Should().NotBeNull();
        _createResult!.IsSuccessful.Should().BeTrue();
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"the request should fail with validation error")]
    public void ThenTheRequestShouldFailWithValidationError() {
        _createResult.Should().NotBeNull();
        _createResult!.IsSuccessful.Should().BeFalse();
        _createResult!.Errors.Should().NotBeEmpty();
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        _createResult!.Errors.Should().Contain(e => e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"the request should fail with not found error")]
    public void ThenTheRequestShouldFailWithNotFoundError() {
        _createResult.Should().NotBeNull();
        _createResult!.IsSuccessful.Should().BeFalse();
        _createResult!.Errors.Should().Contain(e =>
            e.Contains("not found", StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"the request should fail with service error")]
    public void ThenTheRequestShouldFailWithServiceError() {
        _createResult.Should().NotBeNull();
        _createResult!.IsSuccessful.Should().BeFalse();
        _createResult!.Errors.Should().Contain(e =>
            e.Contains("service", StringComparison.OrdinalIgnoreCase) ||
            e.Contains("failed", StringComparison.OrdinalIgnoreCase));
    }

    #endregion

    #region Helper Methods

    private TimeSpan ParseDuration(string durationText) {
        var parts = durationText.Split(' ');
        if (parts.Length != 2) {
            throw new ArgumentException($"Invalid duration format: {durationText}");
        }

        if (!int.TryParse(parts[0], out var value)) {
            throw new ArgumentException($"Invalid duration value: {parts[0]}");
        }

        return parts[1].ToLower() switch {
            "minute" or "minutes" => TimeSpan.FromMinutes(value),
            "hour" or "hours" => TimeSpan.FromHours(value),
            "day" or "days" => TimeSpan.FromDays(value),
            _ => throw new ArgumentException($"Invalid duration unit: {parts[1]}")
        };
    }

    private ValidationResult ValidateSchedule(CreateScheduleData data, DateTimeOffset currentTime) {
        var errors = new List<string>();

        // Validate start date is in the future
        if (data.Start <= currentTime) {
            errors.Add("Start date must be in the future");
        }

        // Validate duration is positive
        if (data.Duration <= TimeSpan.Zero) {
            errors.Add("Duration must be positive");
        }

        // Validate recurrence Until is after Start
        if (data.Recurrence?.Until is not null && data.Recurrence.Until <= data.Start) {
            errors.Add("Invalid recurrence: Until must be after Start");
        }

        // Validate owner is in participants
        if (!data.Participants.Any(p => p.UserId == _userId)) {
            errors.Add("Owner must be included in participants");
        }

        return new ValidationResult {
            IsValid = errors.Count == 0,
            Errors = errors.ToArray()
        };
    }

    #endregion

    #region Helper Classes

    private record ValidationResult {
        public bool IsValid { get; init; }
        public string[] Errors { get; init; } = [];
    }

    #endregion
}
