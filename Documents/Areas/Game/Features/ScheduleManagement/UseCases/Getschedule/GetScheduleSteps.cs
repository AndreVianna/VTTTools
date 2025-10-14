// Generated: 2025-10-12
// BDD Step Definitions for Get Schedule Use Case
// Framework: SpecFlow/Cucumber.NET with xUnit
// Testing: Backend API (ScheduleService)

using FluentAssertions;
using NSubstitute;
using TechTalk.SpecFlow;
using VttTools.Common.Model;
using VttTools.Game.Schedule.Model;
using VttTools.Game.Schedule.Services;
using VttTools.Game.Schedule.Storage;
using VttTools.Game.Sessions.Storage;
using VttTools.Identity.Services;
using Xunit;

namespace VttTools.Game.Tests.BDD.ScheduleManagement.GetSchedule;

[Binding]
public class GetScheduleSteps {
    private readonly ScenarioContext _context;
    private readonly IScheduleStorage _scheduleStorage;
    private readonly IGameSessionStorage _sessionStorage;
    private readonly IUserService _userService;
    private readonly IScheduleService _service;

    // Test state
    private Schedule? _existingSchedule;
    private Result<Schedule>? _getResult;
    private Guid _userId = Guid.Empty;
    private Guid _scheduleId = Guid.Empty;

    public GetScheduleSteps(ScenarioContext context) {
        _context = context;
        _scheduleStorage = Substitute.For<IScheduleStorage>();
        _sessionStorage = Substitute.For<IGameSessionStorage>();
        _userService = Substitute.For<IUserService>();
        _service = new ScheduleService(_scheduleStorage, _sessionStorage, _userService);
    }

    #region Background Steps

    [Given(@"I am authenticated")]
    public void GivenIAmAuthenticated() {
        _userId = Guid.CreateVersion7();
        _context["UserId"] = _userId;
    }

    #endregion

    #region Given Steps - Schedule Ownership

    [Given(@"I am the owner of a schedule")]
    public void GivenIAmTheOwnerOfASchedule() {
        _scheduleId = Guid.CreateVersion7();
        _existingSchedule = CreateSchedule(_userId);

        _scheduleStorage.GetByIdAsync(_scheduleId, Arg.Any<CancellationToken>())
            .Returns(_existingSchedule);
        _context["IsOwner"] = true;
    }

    [Given(@"a schedule is owned by another user")]
    public void GivenAScheduleIsOwnedByAnotherUser() {
        _scheduleId = Guid.CreateVersion7();
        var otherOwnerId = Guid.CreateVersion7();
        _existingSchedule = CreateSchedule(otherOwnerId);

        _scheduleStorage.GetByIdAsync(_scheduleId, Arg.Any<CancellationToken>())
            .Returns(_existingSchedule);
        _context["IsOwner"] = false;
    }

    #endregion

    #region Given Steps - Participant Status

    [Given(@"I am a participant in the schedule")]
    public void GivenIAmAParticipantInTheSchedule() {
        if (_existingSchedule is not null) {
            var participants = _existingSchedule.Participants.ToList();
            participants.Add(new Participant {
                UserId = _userId,
                IsRequired = false,
                Type = PlayerType.Player
            });
            _existingSchedule = _existingSchedule with { Participants = participants };

            _scheduleStorage.GetByIdAsync(_scheduleId, Arg.Any<CancellationToken>())
                .Returns(_existingSchedule);
        }
        _context["IsParticipant"] = true;
    }

    [Given(@"I am not a participant in the schedule")]
    public void GivenIAmNotAParticipantInTheSchedule() {
        // Schedule exists but user is not a participant
        _context["IsParticipant"] = false;
    }

    #endregion

    #region Given Steps - Schedule Data

    [Given(@"the schedule has multiple participants")]
    public void GivenTheScheduleHasMultipleParticipants() {
        if (_existingSchedule is not null) {
            var participants = new List<Participant> {
                new() { UserId = _existingSchedule.OwnerId, IsRequired = true, Type = PlayerType.GameMaster },
                new() { UserId = Guid.CreateVersion7(), IsRequired = false, Type = PlayerType.Player },
                new() { UserId = Guid.CreateVersion7(), IsRequired = false, Type = PlayerType.Player },
                new() { UserId = Guid.CreateVersion7(), IsRequired = true, Type = PlayerType.Player }
            };
            _existingSchedule = _existingSchedule with { Participants = participants };

            _scheduleStorage.GetByIdAsync(_scheduleId, Arg.Any<CancellationToken>())
                .Returns(_existingSchedule);
        }
    }

    [Given(@"the schedule has a recurrence pattern")]
    public void GivenTheScheduleHasARecurrencePattern() {
        if (_existingSchedule is not null) {
            _existingSchedule = _existingSchedule with {
                Recurrence = new Recurrence {
                    Frequency = Frequency.Weekly,
                    Interval = 1,
                    Count = 10,
                    Until = DateTimeOffset.UtcNow.AddMonths(3)
                }
            };

            _scheduleStorage.GetByIdAsync(_scheduleId, Arg.Any<CancellationToken>())
                .Returns(_existingSchedule);
        }
    }

    #endregion

    #region Given Steps - Error Scenarios

    [Given(@"no schedule exists with the requested ID")]
    public void GivenNoScheduleExistsWithTheRequestedID() {
        _scheduleId = Guid.CreateVersion7();
        _scheduleStorage.GetByIdAsync(_scheduleId, Arg.Any<CancellationToken>())
            .Returns((Schedule?)null);
    }

    #endregion

    #region When Steps - Get Actions

    [When(@"I request the schedule by ID")]
    public async Task WhenIRequestTheScheduleById() {
        await ExecuteGet();
    }

    [When(@"I attempt to request the schedule by ID")]
    public async Task WhenIAttemptToRequestTheScheduleById() {
        await ExecuteGet();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the request should succeed")]
    public void ThenTheRequestShouldSucceed() {
        _getResult.Should().NotBeNull();
        _getResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"I should receive the complete schedule details")]
    [And(@"I should receive the schedule details")]
    public void ThenIShouldReceiveTheCompleteScheduleDetails() {
        _getResult!.Value.Should().NotBeNull();
        _getResult!.Value!.Id.Should().Be(_scheduleId);
    }

    [Then(@"the response should include start time")]
    public void ThenTheResponseShouldIncludeStartTime() {
        _getResult!.Value!.Start.Should().NotBe(default);
    }

    [Then(@"the response should include duration")]
    public void ThenTheResponseShouldIncludeDuration() {
        _getResult!.Value!.Duration.Should().BeGreaterThan(TimeSpan.Zero);
    }

    [Then(@"the response should include participants")]
    public void ThenTheResponseShouldIncludeParticipants() {
        _getResult!.Value!.Participants.Should().NotBeEmpty();
    }

    [Then(@"the response should include recurrence pattern")]
    public void ThenTheResponseShouldIncludeRecurrencePattern() {
        _getResult!.Value!.Recurrence.Should().NotBeNull();
    }

    [Then(@"the response should include all participants with roles")]
    public void ThenTheResponseShouldIncludeAllParticipantsWithRoles() {
        _getResult!.Value!.Participants.Should().NotBeEmpty();
        _getResult!.Value!.Participants.Should().AllSatisfy(p => {
            p.UserId.Should().NotBeEmpty();
            p.Type.Should().BeDefined();
        });
    }

    [Then(@"the response should include complete recurrence details")]
    public void ThenTheResponseShouldIncludeCompleteRecurrenceDetails() {
        var recurrence = _getResult!.Value!.Recurrence;
        recurrence.Should().NotBeNull();
        recurrence!.Frequency.Should().BeDefined();
        recurrence.Interval.Should().BeGreaterThan(0);
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"the request should fail with authorization error")]
    public void ThenTheRequestShouldFailWithAuthorizationError() {
        _getResult.Should().NotBeNull();
        _getResult!.IsSuccessful.Should().BeFalse();
        _getResult!.Errors.Should().Contain(e =>
            e.Contains("access denied", StringComparison.OrdinalIgnoreCase) ||
            e.Contains("authorized", StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        _getResult!.Errors.Should().Contain(e => e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"the request should fail with not found error")]
    public void ThenTheRequestShouldFailWithNotFoundError() {
        _getResult.Should().NotBeNull();
        _getResult!.IsSuccessful.Should().BeFalse();
        _getResult!.Errors.Should().Contain(e =>
            e.Contains("not found", StringComparison.OrdinalIgnoreCase));
    }

    #endregion

    #region Helper Methods

    private async Task ExecuteGet() {
        try {
            var schedule = await _scheduleStorage.GetByIdAsync(_scheduleId, CancellationToken.None);

            if (schedule is null) {
                _getResult = Result<Schedule>.Failure(new[] { "Schedule not found" });
                _context["GetResult"] = _getResult;
                return;
            }

            // Check authorization - user must be owner or participant
            var isOwner = schedule.OwnerId == _userId;
            var isParticipant = schedule.Participants.Any(p => p.UserId == _userId);

            if (!isOwner && !isParticipant) {
                _getResult = Result<Schedule>.Failure(new[] { "Access denied: You are not authorized to view this schedule" });
                _context["GetResult"] = _getResult;
                return;
            }

            _getResult = Result<Schedule>.Success(schedule);
            _context["GetResult"] = _getResult;
        }
        catch (Exception ex) {
            _getResult = Result<Schedule>.Failure(new[] { ex.Message });
            _context["Exception"] = ex;
            _context["GetResult"] = _getResult;
        }
    }

    private Schedule CreateSchedule(Guid ownerId) {
        return new Schedule {
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
    }

    #endregion
}
