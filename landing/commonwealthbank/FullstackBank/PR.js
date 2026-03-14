Key Changes
Frontend:

Integrated emoji-mart (v3.0.1) to provide a user-friendly emoji picker.

Updated GoalManager.tsx to include an "Add icon" button and a GoalIcon display component.

Managed state for the emoji picker visibility and icon selection.

Backend & API:

Modified the Goal model to include an icon property.

Added a PUT request handler in lib.ts using Axios to persist goal updates to the server.

Updated the GoalController (C#) to handle icon data during updates.

Testing:

Added unit tests in GoalControllerTests.cs using xUnit to verify the GetGoalsForUser route and ensure icon data integrity.

Testing Done
Verified that icons appear on Goal Cards in the Dashboard.

Confirmed that icon changes persist after a page refresh using Postman and manual UI testing.

All 12 backend unit tests passed successfully.