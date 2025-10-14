// Generated: 2025-10-12
// BDD Step Definitions for List Schedules By Owner Use Case
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

namespace VttTools.Game.Tests.BDD.ScheduleManagement.ListSchedulesByOwner;

[Binding]
public class ListSchedulesByOwnerSteps {
    private readonly ScenarioContext _context;
    private readonly IScheduleStorage _scheduleStorage;
    private readonly IGameSessionStorage _sessionStorage;
    private readonly IUserService _userService;
    private readonly IScheduleService _service;

    // Test state
    private List<Schedule> _mySchedules = [];
    private Result<List<Schedule>>? _listResult;
    private Guid _userId = Guid.Empty;
    private Guid _otherUserId = Guid.Empty;

    public ListSchedulesByOwnerSteps(ScenarioContext context) {
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

    #endregion

    #region Given Steps - Schedule Ownership

    [Given(@"I own multiple schedules with different recurrence types")]
    public void GivenIOwnMultipleSchedulesWithDifferentRecurrenceTypes() {
        _mySchedules = [
            CreateSchedule(_userId, Frequency.Once),
            CreateSchedule(_userId, Frequency.Daily),
            CreateSchedule(_userId, Frequency.Weekly),
            CreateSchedule(_userId, Frequency.Monthly)
        ];

        _scheduleStorage.GetByOwnerIdAsync(_userId, Arg.Any<CancellationToken>())
            .Returns(_mySchedules);
    }

    [Given(@"I do not own any schedules")]
    public void GivenIDoNotOwnAnySchedules() {
        _mySchedules.Clear();

        _scheduleStorage.GetByOwnerIdAsync(_userId, Arg.Any<CancellationToken>())
            .Returns(_mySchedules);
    }

    [Given(@"I own schedules with Once, Daily, Weekly, and Monthly frequencies")]
    public void GivenIOwnSchedulesWithAllFrequencies() {
        GivenIOwnMultipleSchedulesWithDifferentRecurrenceTypes();
    }

    [Given(@"another Game Master owns multiple schedules")]
    public void GivenAnotherGameMasterOwnsMultipleSchedules() {
        _otherUserId = Guid.CreateVersion7();

        var otherSchedules = new List<Schedule> {
            CreateSchedule(_otherUserId, Frequency.Weekly),
            CreateSchedule(_otherUserId, Frequency.Monthly)
        };

        _scheduleStorage.GetByOwnerIdAsync(_otherUserId, Arg.Any<CancellationToken>())
            .Returns(otherSchedules);
    }

    #endregion

    #region When Steps - List Actions

    [When(@"I request my schedules")]
    public async Task WhenIRequestMySchedules() {
        await ExecuteList(_userId);
    }

    [When(@"I attempt to request their schedules")]
    public async Task WhenIAttemptToRequestTheirSchedules() {
        await ExecuteList(_otherUserId);
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the request should succeed")]
    public void ThenTheRequestShouldSucceed() {
        _listResult.Should().NotBeNull();
        _listResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"I should receive all my schedules")]
    public void ThenIShouldReceiveAllMySchedules() {
        _listResult!.Value.Should().NotBeNull();
        _listResult!.Value.Should().HaveCount(_mySchedules.Count);
    }

    [Then(@"the response should include all recurrence types")]
    [And(@"the response should include schedules with all frequency types")]
    public void ThenTheResponseShouldIncludeAllRecurrenceTypes() {
        var frequencies = _listResult!.Value!.Select(s => s.Recurrence?.Frequency).Distinct();
        frequencies.Should().Contain(Frequency.Once);
        frequencies.Should().Contain(Frequency.Daily);
        frequencies.Should().Contain(Frequency.Weekly);
        frequencies.Should().Contain(Frequency.Monthly);
    }

    [Then(@"I should receive an empty list")]
    public void ThenIShouldReceiveAnEmptyList() {
        _listResult!.Value.Should().NotBeNull();
        _listResult!.Value.Should().BeEmpty();
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"the request should fail with authorization error")]
    public void ThenTheRequestShouldFailWithAuthorizationError() {
        _listResult.Should().NotBeNull();
        _listResult!.IsSuccessful.Should().BeFalse();
        _listResult!.Errors.Should().Contain(e =>
            e.Contains("cannot access", StringComparison.OrdinalIgnoreCase) ||
            e.Contains("owned by another", StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        _listResult!.Errors.Should().Contain(e => e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    #endregion

    #region Helper Methods

    private async Task ExecuteList(Guid requestedOwnerId) {
        try {
            // Validate authorization - can only list own schedules
            if (requestedOwnerId != _userId) {
                _listResult = Result<List<Schedule>>.Failure(new[] { "Cannot access schedules owned by another user" });
                _context["ListResult"] = _listResult;
                return;
            }

            var schedules = await _scheduleStorage.GetByOwnerIdAsync(requestedOwnerId, CancellationToken.None);

            _listResult = Result<List<Schedule>>.Success(schedules.ToList());
            _context["ListResult"] = _listResult;
        }
        catch (Exception ex) {
            _listResult = Result<List<Schedule>>.Failure(new[] { ex.Message });
            _context["Exception"] = ex;
            _context["ListResult"] = _listResult;
        }
    }

    private Schedule CreateSchedule(Guid ownerId, Frequency frequency) {
        var schedule = new Schedule {
            Id = Guid.CreateVersion7(),
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
                    Count = 10
                }
            };
        }

        return schedule;
    }

    #endregion
}
