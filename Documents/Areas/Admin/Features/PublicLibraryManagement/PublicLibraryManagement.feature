Feature: Admin Public Library Management
  As a system administrator
  I want to manage public library content
  So that I can provide quality assets, adventures, and encounters to all users

  Background:
    Given I am logged in as an administrator in the admin app
    And the admin dashboard is displayed

  @smoke
  Scenario: View public library content list
    When I navigate to the Public Library Management page
    Then I should see a list of all system-owned content
    And the list should display: Thumbnail, Name, Type, Status, Category, Price, Downloads, Created Date, Published Date

  @critical
  Scenario: Upload new asset to public library (Draft status)
    Given I am on the Public Library Management page
    When I click "Upload Content"
    And I select content type "Asset"
    And I drag-and-drop a file "dragon-token.png"
    And I fill in metadata:
      | Field       | Value                          |
      | Name        | Red Dragon Token               |
      | Description | Classic red dragon battle token |
      | Category    | Fantasy                        |
      | Tags        | dragon, token, creature        |
    And I submit the upload
    Then the asset should be uploaded to blob storage
    And a database entry should be created with OwnerId = null (system-owned)
    And the status should be "Draft"
    And I should see a success notification
    And an audit log entry should be created

  @critical
  Scenario: Publish asset to public library (Draft → Public)
    Given I have a Draft asset "Red Dragon Token"
    When I select the asset from the list
    And I open the content detail dialog
    And I navigate to the "Availability" tab
    And I select status "Public"
    And I click "Publish"
    And I confirm the action: "Publish Red Dragon Token to public library? Users will see this content immediately."
    Then the asset status should change to "Public"
    And the PublishedDate should be set to current timestamp
    And the asset should appear in the main app public library within 30 seconds
    And an audit log entry should be created

  @critical
  Scenario: Set asset as Premium with price
    Given I have a Draft asset "Deluxe Dungeon Map Pack"
    When I open the content detail dialog
    And I navigate to the "Availability" tab
    And I select status "Premium"
    And I enter price "9.99" in USD
    And I click "Save"
    Then the asset should be marked as Premium
    And the price should be stored (payment processing deferred to EPIC-003)
    And the asset should display "Premium" badge in public library
    And an audit log entry should be created

  @high
  Scenario: Unpublish content (Public → Draft)
    Given I have a Public asset "Red Dragon Token"
    When I open the content detail dialog
    And I click "Unpublish"
    And I confirm: "Unpublish Red Dragon Token? Users will no longer see this in public library."
    Then the asset status should change to "Draft"
    And the PublishedDate should be cleared
    And the asset should be removed from public library
    And an audit log entry should be created

  @medium
  Scenario: Delete content (soft delete)
    Given I have a Draft asset "Old Token"
    And the asset has 150 downloads
    When I open the content detail dialog
    And I click "Delete"
    And I confirm: "Delete Old Token? This action cannot be undone. 150 users have downloaded this content."
    Then the asset should be soft deleted (IsDeleted flag set)
    And the asset should not appear in the public library
    And the asset should not appear in the admin content list
    And an audit log entry should be created

  @medium
  Scenario: Upload preview images
    Given I have an asset "Epic Adventure Pack"
    When I open the content detail dialog
    And I navigate to the "Preview Images" tab
    And I upload 3 preview images via drag-and-drop
    Then all 3 images should be uploaded to blob storage
    And the first image should be set as the thumbnail
    And I should be able to reorder images by dragging
    And I should be able to delete individual images

  @medium
  Scenario: View content analytics
    Given I have a Public asset "Red Dragon Token"
    And the asset has been downloaded 500 times
    When I open the content detail dialog
    And I navigate to the "Analytics" tab
    Then I should see:
      | Metric                  | Value |
      | Total Downloads         | 500   |
      | Downloads Last 7 Days   | 45    |
      | Downloads Last 30 Days  | 180   |
    And I should see a downloads trend chart (last 30 days)

  @medium
  Scenario: Filter content by status
    Given the public library has content with various statuses
    When I select "Premium" from the status filter
    Then the list should show only Premium content
    And Draft and Public content should be filtered out

  @medium
  Scenario: Search content by name
    Given the public library has 50 content items
    When I type "dragon" in the search bar
    Then the list should show only content with "dragon" in the name or description
    And unrelated content should not be visible

  @low
  Scenario: Bulk publish content
    Given I have 5 Draft assets selected with checkboxes
    When I choose "Publish Selected" from the bulk actions dropdown
    And I confirm the bulk action
    Then all 5 assets should be published
    And their status should change to "Public"
    And PublishedDate should be set for all
    And I should see "5 items published, 0 failed"
    And 5 audit log entries should be created

  @low
  Scenario: Add new category
    Given I am on the Public Library Management page
    When I click the Settings button
    And I navigate to the Categories section
    And I click "Add New Category"
    And I enter category name "Horror"
    And I save the category
    Then "Horror" should be available in the category dropdown
    And an audit log entry should be created

  @low
  Scenario: View projected revenue for Premium content
    Given I have a Premium asset "Deluxe Map Pack" priced at $9.99
    And the asset has 250 downloads
    When I view the analytics tab
    Then I should see "Projected Revenue: $2,497.50"
    And a note "Actual revenue tracking in EPIC-003"
