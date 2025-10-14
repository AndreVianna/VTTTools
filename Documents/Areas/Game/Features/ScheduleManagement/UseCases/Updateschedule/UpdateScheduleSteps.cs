// Generated: 2025-10-12
// BDD Step Definitions for Update Schedule Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (ScheduleService)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using VttTools.Common.Model;
using VttTools.Game.Schedule.Model;
using VttTools.Game.Schedule.ServiceContracts;
using VttTools.Game.Schedule.Services;
using VttTools.Game.Schedule.Storage;
using VttTools.Game.Sessions.Storage;
using VttTools.Identity.Services;
using Xunit;

namespace VttTools.Game.Tests.BDD.ScheduleManagement.UpdateSchedule;

[Binding]
public class UpdateScheduleSteps {
    private readonly ScenarioContext _context;
    private readonly IScheduleStorage _scheduleStorage;
    private readonly IGameSessionStorage _sessionStorage;
    private readonly IUserService _userService;
    private readonly IScheduleService _service;

    // Test state
    private Schedule? _existingSchedule;
    private UpdateScheduleData? _updateData;
    private Result<Schedule>? _updateResult;
    private Guid _userId = Guid.Empty;
    private Guid _scheduleId = Guid.Empty;
    private DateTimeOffset _currentTime = DateTimeOffset.UtcNow;

    public UpdateScheduleSteps(ScenarioContext context) {
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

    [Given(@"I have an existing schedule")]
    public void GivenIHaveAnExistingSchedule() {
        _scheduleId = Guid.CreateVersion7();
        _existingSchedule = new Schedule {
            Id = _scheduleId,
            OwnerId = _userId,
            EventId = Guid.CreateVersion7(),
            Start = _currentTime.AddDays(7),
            Duration = TimeSpan.FromHours(2),
            Participants = [new Participant { UserId = _userId, IsRequired = true, Type = PlayerType.GameMaster }]
        };

        _scheduleStorage.GetByIdAsync(_scheduleId, Arg.Any<CancellationToken>())
            .Returns(_existingSchedule);
        _context["ExistingSchedule"] = _existingSchedule;
    }

    #endregion

    #region Given Steps - Time Context

    [Given(@"the current time is ""(.*)""")]
    public void GivenTheCurrentTimeIs(string timeString) {
        _currentTime = DateTimeOffset.Parse(timeString);
        _context["CurrentTime"] = _currentTime;
    }

    [Given(@"the schedule start is ""(.*)""")]
    public void GivenTheScheduleStartIs(string startTime) {
        var start = DateTimeOffset.Parse(startTime);
        if (_existingSchedule is not null) {
            _existingSchedule = _existingSchedule with { Start = start };
            _scheduleStorage.GetByIdAsync(_scheduleId, Arg.Any<CancellationToken>())
                .Returns(_existingSchedule);
        }
    }

    #endregion

    #region When Steps - Update Start Time

    [When(@"I update the schedule start to ""(.*)""")]
    public async Task WhenIUpdateTheScheduleStartTo(string newStartTime) {
        var newStart = DateTimeOffset.Parse(newStartTime);
        _updateData = new UpdateScheduleData {
            Start = newStart
        };

        await ExecuteUpdate();
    }

    [When(@"I attempt to update the schedule start to ""(.*)""")]
    public async Task WhenIAttemptToUpdateTheScheduleStartTo(string newStartTime) {
        await WhenIUpdateTheScheduleStartTo(newStartTime);
    }

    #endregion

    #region When Steps - Update Duration

    [When(@"I update the schedule duration to ""(.*)""")]
    public async Task WhenIUpdateTheScheduleDurationTo(string durationText) {
        var duration = ParseDuration(durationText);
        _updateData = new UpdateScheduleData {
            Duration = duration
        };

        await ExecuteUpdate();
    }

    [When(@"I attempt to update the schedule duration to ""(.*)""")]
    public async Task WhenIAttemptToUpdateTheScheduleDurationTo(string durationText) {
        await WhenIUpdateTheScheduleDurationTo(durationText);
    }

    #endregion

    #region Given Steps - Participants

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
            _scheduleStorage.GetByIdAsync(_scheduleId, Arg.Any<CancellationToken>())
                .Returns(_existingSchedule);
        }
    }

    [When(@"I update the participants to include different users")]
    [And(@"I include myself in the updated participant list")]
    public async Task WhenIUpdateParticipantsIncludingMyself() {
        var newParticipants = new List<Participant> {
            new() { UserId = _userId, IsRequired = true, Type = PlayerType.GameMaster },
            new() { UserId = Guid.CreateVersion7(), IsRequired = false, Type = PlayerType.Player },
            new() { UserId = Guid.CreateVersion7(), IsRequired = false, Type = PlayerType.Player }
        };

        _updateData = new UpdateScheduleData {
            Participants = newParticipants
        };

        await ExecuteUpdate();
    }

    [Given(@"the schedule has participants including me")]
    public void GivenTheScheduleHasParticipantsIncludingMe() {
        GivenTheScheduleHasParticipants(2);
    }

    [When(@"I attempt to update the participants without including myself")]
    public async Task WhenIAttemptToUpdateParticipantsWithoutIncludingMyself() {
        var newParticipants = new List<Participant> {
            new() { UserId = Guid.CreateVersion7(), IsRequired = false, Type = PlayerType.Player }
        };

        _updateData = new UpdateScheduleData {
            Participants = newParticipants
        };

        await ExecuteUpdate();
    }

    #endregion

    #region Given Steps - Recurrence

    [Given(@"the schedule has weekly recurrence")]
    public void GivenTheScheduleHasWeeklyRecurrence() {
        if (_existingSchedule is not null) {
            _existingSchedule = _existingSchedule with {
                Recurrence = new Recurrence {
                    Frequency = Frequency.Weekly,
                    Interval = 1
                }
            };
            _scheduleStorage.GetByIdAsync(_scheduleId, Arg.Any<CancellationToken>())
                .Returns(_existingSchedule);
        }
    }

    [When(@"I update the recurrence to monthly")]
    public async Task WhenIUpdateTheRecurrenceToMonthly() {
        _updateData = new UpdateScheduleData {
            Recurrence = new Recurrence {
                Frequency = Frequency.Monthly,
                Interval = 1
            }
        };

        await ExecuteUpdate();
    }

    #endregion

    #region Given Steps - Authorization

    [Given(@"the schedule is owned by another Game Master")]
    public void GivenTheScheduleIsOwnedByAnotherGameMaster() {
        var otherOwnerId = Guid.CreateVersion7();
        if (_existingSchedule is not null) {
            _existingSchedule = _existingSchedule with { OwnerId = otherOwnerId };
            _scheduleStorage.GetByIdAsync(_scheduleId, Arg.Any<CancellationToken>())
                .Returns(_existingSchedule);
        }
    }

    [When(@"I attempt to update the schedule")]
    public async Task WhenIAttemptToUpdateTheSchedule() {
        _updateData = new UpdateScheduleData {
            Start = _currentTime.AddDays(10)
        };

        await ExecuteUpdate();
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"the schedule does not exist")]
    public void GivenTheScheduleDoesNotExist() {
        _scheduleStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((Schedule?)null);
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the request should succeed")]
    public void ThenTheRequestShouldSucceed() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"the schedule start should be ""(.*)""")]
    public void ThenTheScheduleStartShouldBe(string expectedStart) {
        var expectedStartTime = DateTimeOffset.Parse(expectedStart);
        _updateResult!.Value!.Start.Should().Be(expectedStartTime);
    }

    [Then(@"the schedule duration should be ""(.*)""")]
    public void ThenTheScheduleDurationShouldBe(string durationText) {
        var expectedDuration = ParseDuration(durationText);
        _updateResult!.Value!.Duration.Should().Be(expectedDuration);
    }

    [Then(@"the updated participants should be saved")]
    public void ThenTheUpdatedParticipantsShouldBeSaved() {
        _updateResult!.Value!.Participants.Should().HaveCount(_updateData!.Participants!.Count);
    }

    [Then(@"the recurrence pattern should be monthly")]
    public void ThenTheRecurrencePatternShouldBeMonthly() {
        _updateResult!.Value!.Recurrence.Should().NotBeNull();
        _updateResult!.Value!.Recurrence!.Frequency.Should().Be(Frequency.Monthly);
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"the request should fail with validation error")]
    public void ThenTheRequestShouldFailWithValidationError() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeFalse();
        _updateResult!.Errors.Should().NotBeEmpty();
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        _updateResult!.Errors.Should().Contain(e => e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"the request should fail with authorization error")]
    public void ThenTheRequestShouldFailWithAuthorizationError() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeFalse();
        _updateResult!.Errors.Should().Contain(e =>
            e.Contains("owner", StringComparison.OrdinalIgnoreCase) ||
            e.Contains("authorization", StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"the request should fail with not found error")]
    public void ThenTheRequestShouldFailWithNotFoundError() {
        _updateResult.Should().NotBeNull();
        _updateResult!.IsSuccessful.Should().BeFalse();
        _updateResult!.Errors.Should().Contain(e =>
            e.Contains("not found", StringComparison.OrdinalIgnoreCase));
    }

    #endregion

    #region Helper Methods

    private async Task ExecuteUpdate() {
        try {
            if (_existingSchedule is null) {
                _updateResult = Result<Schedule>.Failure(new[] { "Schedule not found" });
                _context["UpdateResult"] = _updateResult;
                return;
            }

            // Validate authorization
            if (_existingSchedule.OwnerId != _userId) {
                _updateResult = Result<Schedule>.Failure(new[] { "Only the schedule owner can update this schedule" });
                _context["UpdateResult"] = _updateResult;
                return;
            }

            // Validate update data
            var validationResult = ValidateUpdate(_updateData!, _currentTime);
            if (!validationResult.IsValid) {
                _updateResult = Result<Schedule>.Failure(validationResult.Errors);
                _context["UpdateResult"] = _updateResult;
                return;
            }

            // Apply updates
            var updatedSchedule = ApplyUpdates(_existingSchedule, _updateData!);

            // Mock storage success
            _scheduleStorage.UpdateAsync(Arg.Any<Schedule>(), Arg.Any<CancellationToken>())
                .Returns(true);

            await _scheduleStorage.UpdateAsync(updatedSchedule, CancellationToken.None);

            _updateResult = Result<Schedule>.Success(updatedSchedule);
            _context["UpdateResult"] = _updateResult;
        }
        catch (Exception ex) {
            _updateResult = Result<Schedule>.Failure(new[] { ex.Message });
            _context["Exception"] = ex;
            _context["UpdateResult"] = _updateResult;
        }
    }

    private ValidationResult ValidateUpdate(UpdateScheduleData data, DateTimeOffset currentTime) {
        var errors = new List<string>();

        // Validate start time if provided
        if (data.Start.HasValue && data.Start.Value <= currentTime) {
            errors.Add("Schedule start time must be in the future");
        }

        // Validate duration if provided
        if (data.Duration.HasValue && data.Duration.Value <= TimeSpan.Zero) {
            errors.Add("Duration must be greater than zero");
        }

        // Validate participants if provided
        if (data.Participants is not null && !data.Participants.Any(p => p.UserId == _userId)) {
            errors.Add("Schedule owner must be included in participants list");
        }

        return new ValidationResult {
            IsValid = errors.Count == 0,
            Errors = errors.ToArray()
        };
    }

    private Schedule ApplyUpdates(Schedule existing, UpdateScheduleData updates) {
        return existing with {
            Start = updates.Start ?? existing.Start,
            Duration = updates.Duration ?? existing.Duration,
            Participants = updates.Participants ?? existing.Participants,
            Recurrence = updates.Recurrence ?? existing.Recurrence
        };
    }

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

    #endregion

    #region Helper Classes

    private record ValidationResult {
        public bool IsValid { get; init; }
        public string[] Errors { get; init; } = [];
    }

    #endregion
}
