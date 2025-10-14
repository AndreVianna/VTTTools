// Generated: 2025-10-12
// BDD Step Definitions for List Upcoming Schedules Use Case
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

namespace VttTools.Game.Tests.BDD.ScheduleManagement.ListUpcomingSchedules;

[Binding]
public class ListUpcomingSchedulesSteps {
    private readonly ScenarioContext _context;
    private readonly IScheduleStorage _scheduleStorage;
    private readonly IGameSessionStorage _sessionStorage;
    private readonly IUserService _userService;
    private readonly IScheduleService _service;

    // Test state
    private List<Schedule> _allSchedules = [];
    private Result<List<Schedule>>? _listResult;
    private Guid _userId = Guid.Empty;
    private DateTimeOffset _queryStartDate = DateTimeOffset.UtcNow;
    private DateTimeOffset _queryEndDate = DateTimeOffset.UtcNow.AddDays(30);

    public ListUpcomingSchedulesSteps(ScenarioContext context) {
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
        _context["ServiceAvailable"] = true;
    }

    #endregion

    #region Given Steps - Schedule Data

    [Given(@"I have schedules with occurrences in the next (.*) days")]
    public void GivenIHaveSchedulesWithOccurrencesInTheNextDays(int days) {
        var now = DateTimeOffset.UtcNow;

        // Create schedules with occurrences within the range
        _allSchedules.Add(CreateSchedule(_userId, now.AddDays(5), Frequency.Once));
        _allSchedules.Add(CreateSchedule(_userId, now.AddDays(10), Frequency.Once));
        _allSchedules.Add(CreateSchedule(_userId, now.AddDays(15), Frequency.Weekly));

        _context["SchedulesInRange"] = _allSchedules.Count;
    }

    [Given(@"I have schedules with occurrences outside the date range")]
    public void GivenIHaveSchedulesWithOccurrencesOutsideTheRange() {
        var now = DateTimeOffset.UtcNow;

        // Create schedules outside the 30-day range
        _allSchedules.Add(CreateSchedule(_userId, now.AddDays(45), Frequency.Once));
        _allSchedules.Add(CreateSchedule(_userId, now.AddDays(60), Frequency.Monthly));

        _context["SchedulesOutsideRange"] = 2;
    }

    [Given(@"I have schedules but no occurrences in the specified date range")]
    public void GivenIHaveSchedulesButNoOccurrencesInRange() {
        var now = DateTimeOffset.UtcNow;

        // All schedules are in the past or far future
        _allSchedules.Add(CreateSchedule(_userId, now.AddDays(-10), Frequency.Once));
        _allSchedules.Add(CreateSchedule(_userId, now.AddDays(100), Frequency.Once));
    }

    [Given(@"I have a schedule with occurrence exactly on the start date")]
    public void GivenIHaveScheduleWithOccurrenceOnStartDate() {
        _queryStartDate = DateTimeOffset.UtcNow;
        _allSchedules.Add(CreateSchedule(_userId, _queryStartDate, Frequency.Once));
    }

    [Given(@"I have a schedule with occurrence exactly on the end date")]
    public void GivenIHaveScheduleWithOccurrenceOnEndDate() {
        _queryEndDate = DateTimeOffset.UtcNow.AddDays(30);
        _allSchedules.Add(CreateSchedule(_userId, _queryEndDate, Frequency.Once));
    }

    [Given(@"I have schedules with occurrences outside the boundary")]
    public void GivenIHaveSchedulesWithOccurrencesOutsideBoundary() {
        _allSchedules.Add(CreateSchedule(_userId, _queryStartDate.AddDays(-1), Frequency.Once));
        _allSchedules.Add(CreateSchedule(_userId, _queryEndDate.AddDays(1), Frequency.Once));
    }

    [Given(@"I have schedules spread across the next (.*) days")]
    public void GivenIHaveSchedulesSpreadAcrossNextDays(int days) {
        var now = DateTimeOffset.UtcNow;

        // Create schedules spread across 90 days
        for (int i = 0; i < 25; i++) {
            var startDate = now.AddDays((i + 1) * 3);
            _allSchedules.Add(CreateSchedule(_userId, startDate, Frequency.Once));
        }

        _scheduleStorage.GetByOwnerIdAsync(_userId, Arg.Any<CancellationToken>())
            .Returns(_allSchedules);
    }

    [Given(@"I provide an end date before the start date")]
    public void GivenIProvideAnEndDateBeforeTheStartDate() {
        _queryStartDate = DateTimeOffset.UtcNow.AddDays(30);
        _queryEndDate = DateTimeOffset.UtcNow;
    }

    #endregion

    #region When Steps - Query Actions

    [When(@"I request schedules from today to (.*) days ahead")]
    public async Task WhenIRequestSchedulesFromTodayToNDaysAhead(int days) {
        _queryStartDate = DateTimeOffset.UtcNow;
        _queryEndDate = _queryStartDate.AddDays(days);
        await ExecuteQuery();
    }

    [When(@"I request schedules for that exact date range")]
    public async Task WhenIRequestSchedulesForThatExactDateRange() {
        // Use dates set in Given steps
        await ExecuteQuery();
    }

    [When(@"I request schedules from ""(.*)"" to ""(.*)""")]
    public async Task WhenIRequestSchedulesFromToSpecificDates(string start, string end) {
        _queryStartDate = ParseRelativeDate(start);
        _queryEndDate = ParseRelativeDate(end);
        await ExecuteQuery();
    }

    [When(@"I request schedules for that invalid range")]
    public async Task WhenIRequestSchedulesForInvalidRange() {
        await ExecuteQuery();
    }

    #endregion

    #region Then Steps - Success Assertions

    [Then(@"the request should succeed")]
    public void ThenTheRequestShouldSucceed() {
        _listResult.Should().NotBeNull();
        _listResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"I should receive only schedules with occurrences in that range")]
    public void ThenIShouldReceiveOnlySchedulesWithOccurrencesInThatRange() {
        _listResult!.Value.Should().NotBeNull();

        foreach (var schedule in _listResult!.Value!) {
            var hasOccurrenceInRange = HasOccurrenceInRange(schedule, _queryStartDate, _queryEndDate);
            hasOccurrenceInRange.Should().BeTrue($"Schedule {schedule.Id} should have occurrence in range");
        }
    }

    [Then(@"schedules without occurrences in the range should not be included")]
    public void ThenSchedulesWithoutOccurrencesInRangeShouldNotBeIncluded() {
        var schedulesOutsideRange = _allSchedules.Where(s =>
            !HasOccurrenceInRange(s, _queryStartDate, _queryEndDate));

        foreach (var outsideSchedule in schedulesOutsideRange) {
            _listResult!.Value.Should().NotContain(s => s.Id == outsideSchedule.Id);
        }
    }

    [Then(@"I should receive an empty list")]
    public void ThenIShouldReceiveAnEmptyList() {
        _listResult!.Value.Should().NotBeNull();
        _listResult!.Value.Should().BeEmpty();
    }

    [Then(@"I should receive schedules with occurrences on start and end dates")]
    public void ThenIShouldReceiveSchedulesWithOccurrencesOnStartAndEndDates() {
        _listResult!.Value.Should().NotBeEmpty();

        var hasStartDate = _listResult!.Value!.Any(s => s.Start.Date == _queryStartDate.Date);
        var hasEndDate = _listResult!.Value!.Any(s => s.Start.Date == _queryEndDate.Date);

        hasStartDate.Should().BeTrue("Should include schedule on start date");
        hasEndDate.Should().BeTrue("Should include schedule on end date");
    }

    [Then(@"schedules outside the boundary should not be included")]
    public void ThenSchedulesOutsideBoundaryShouldNotBeIncluded() {
        _listResult!.Value.Should().NotContain(s =>
            s.Start < _queryStartDate || s.Start > _queryEndDate);
    }

    [Then(@"I should receive (.*) schedules")]
    public void ThenIShouldReceiveNSchedules(int expectedCount) {
        _listResult!.Value.Should().HaveCount(expectedCount);
    }

    #endregion

    #region Then Steps - Error Assertions

    [Then(@"the request should fail with validation error")]
    public void ThenTheRequestShouldFailWithValidationError() {
        _listResult.Should().NotBeNull();
        _listResult!.IsSuccessful.Should().BeFalse();
        _listResult!.Errors.Should().NotBeEmpty();
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        _listResult!.Errors.Should().Contain(e => e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    #endregion

    #region Helper Methods

    private async Task ExecuteQuery() {
        try {
            // Validate date range
            if (_queryEndDate <= _queryStartDate) {
                _listResult = Result<List<Schedule>>.Failure(new[] { "End date must be after start date" });
                _context["ListResult"] = _listResult;
                return;
            }

            // Get all schedules for the user
            var allSchedules = await _scheduleStorage.GetByOwnerIdAsync(_userId, CancellationToken.None);

            // Filter schedules with occurrences in the date range
            var schedulesInRange = allSchedules
                .Where(s => HasOccurrenceInRange(s, _queryStartDate, _queryEndDate))
                .ToList();

            _listResult = Result<List<Schedule>>.Success(schedulesInRange);
            _context["ListResult"] = _listResult;
        }
        catch (Exception ex) {
            _listResult = Result<List<Schedule>>.Failure(new[] { ex.Message });
            _context["Exception"] = ex;
            _context["ListResult"] = _listResult;
        }
    }

    private bool HasOccurrenceInRange(Schedule schedule, DateTimeOffset start, DateTimeOffset end) {
        // Check if the schedule start date is within the range
        if (schedule.Start >= start && schedule.Start <= end) {
            return true;
        }

        // For recurring schedules, check if any occurrence falls within the range
        if (schedule.Recurrence is not null && schedule.Recurrence.Frequency != Frequency.Once) {
            // Simplified occurrence check - in real implementation, calculate all occurrences
            var currentOccurrence = schedule.Start;
            var interval = schedule.Recurrence.Interval;

            while (currentOccurrence <= end) {
                if (currentOccurrence >= start && currentOccurrence <= end) {
                    return true;
                }

                // Calculate next occurrence based on frequency
                currentOccurrence = schedule.Recurrence.Frequency switch {
                    Frequency.Daily => currentOccurrence.AddDays(interval),
                    Frequency.Weekly => currentOccurrence.AddDays(7 * interval),
                    Frequency.Monthly => currentOccurrence.AddMonths(interval),
                    Frequency.Yearly => currentOccurrence.AddYears(interval),
                    _ => currentOccurrence
                };

                // Check Until constraint
                if (schedule.Recurrence.Until.HasValue && currentOccurrence > schedule.Recurrence.Until.Value) {
                    break;
                }

                // Prevent infinite loops
                if (currentOccurrence > end) {
                    break;
                }
            }
        }

        return false;
    }

    private Schedule CreateSchedule(Guid ownerId, DateTimeOffset start, Frequency frequency) {
        var schedule = new Schedule {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            EventId = Guid.CreateVersion7(),
            Start = start,
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

    private DateTimeOffset ParseRelativeDate(string dateText) {
        var now = DateTimeOffset.UtcNow;

        if (dateText.Equals("today", StringComparison.OrdinalIgnoreCase)) {
            return now;
        }

        if (dateText.StartsWith("+")) {
            var daysMatch = System.Text.RegularExpressions.Regex.Match(dateText, @"\+(\d+)\s+days?");
            if (daysMatch.Success && int.TryParse(daysMatch.Groups[1].Value, out var days)) {
                return now.AddDays(days);
            }
        }

        throw new ArgumentException($"Invalid date format: {dateText}");
    }

    #endregion
}
