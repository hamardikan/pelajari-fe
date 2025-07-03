Of course. Here is the comprehensive implementation guide as a standard markdown response.

Pelajari Platform - Frontend Implementation Guide
Introduction
This document provides a comprehensive, step-by-step guide to implement the remaining features of the Pelajari platform's frontend. The goal is to connect the existing UI components, state management (Zustand), and API services to create a fully functional application based on the provided API_DOCS.md and workflows.md.

Core Principles:

Component Reusability: Leverage existing common components like Button, Loading, EmptyState, and the MUI theme.

State Management: All application state should be managed through the appropriate Zustand stores (authStore, learningStore, 'practiceStore, idpStore`).

API Integration: All data fetching and mutations must go through the defined services (learningService, practiceService, idpService).

UX/UI Consistency: Adhere strictly to the design principles and user flows outlined in workflows.md.

1. Authentication (src/pages/AuthPage.tsx)
The foundation for authentication is in place, but the login and registration forms are placeholders.

1.1. Create LoginForm.tsx
File Location: src/components/auth/LoginForm.tsx

Objective: Create a form to handle user login.

Implementation Steps:

Create the component:

Use TextField from MUI for "Email" and "Password" fields.

Use the custom Button component for the "Login" button.

Add a link for "Forgot Password?" and a link to the registration page.

State Management:

Use react-hook-form for form state management and validation (recommended).

On submit, call the login action from useAuthStore.

API Call:

The authStore.login action will call apiClient.post(API_ENDPOINTS.AUTH.LOGIN, ...).

User Feedback:

Disable the login button and show a loading state while authStore.isLoading is true.

Display error messages from the API call using react-hot-toast.

Update AuthPage.tsx:

Replace the placeholder LoginForm with this new component.

1.2. Create RegisterForm.tsx
File Location: src/components/auth/RegisterForm.tsx

Objective: Create a multi-step registration form as per workflows.md.

Implementation Steps:

Create the component:

Use a stepper or a state variable to manage the two steps: "Basic Info" and "Role Selection".

Step 1 (Basic Info): TextFields for Name, Email, and Password.

Step 2 (Role Selection): Use ToggleButtonGroup or custom Card components for selecting "Employee" or "Manager".

State Management:

Use react-hook-form to manage form state across steps.

On final submission, call the register action from useAuthStore.

API Call:

The authStore.register action handles the API call. authStore will automatically log the user in upon successful registration.

Update AuthPage.tsx:

Replace the placeholder RegisterForm with this new component.

2. Dashboard (src/pages/DashboardPage.tsx)
The dashboard is the user's landing page and should provide a summary of their learning journey.

Objective: Replace the placeholder content with dynamic, data-driven components based on the workflow document.

Implementation Steps:

Create Dashboard Components:

WelcomeBanner.tsx: Displays a greeting and the user's learning streak.

QuickStatsGrid.tsx: A grid of StatsCard.tsx components. Each card shows a key metric (e.g., "Modules Completed," "Practice Sessions").

ContinueLearning.tsx: Shows the last module the user was working on and recommendations.

RecentActivity.tsx: A timeline feed of recent events.

Data Fetching:

In DashboardPage.tsx, use effects to fetch data from useLearningStore, usePracticeStore, and useIDPStore.

Example: Get modules and userProgress from learningStore to calculate completed modules.

Component Integration:

Assemble the created components within DashboardPage.tsx.

Use the Loading component while data is being fetched.

Use the EmptyState component if there is no data to display (e.g., for a new user).

3. Roleplay Practice (src/pages/PracticePage.tsx)
This section is currently a placeholder. The full workflow needs to be built.

3.1. Scenario Selection
Objective: Display a list of available roleplay scenarios for the user to choose from.

Implementation Steps:

Update PracticePage.tsx:

On component mount, call fetchScenarios from usePracticeStore.

Display scenarios from the store in a grid or list layout.

Create a ScenarioCard.tsx component to display scenario details (title, description, difficulty).

Add search and filter controls that call the fetchScenarios with filter parameters.

When a user clicks a scenario, navigate them to a dynamic route like /practice/scenarios/:scenarioId.

3.2. Scenario Details & Session Start
File Location: src/pages/ScenarioDetailPage.tsx (new file)

Objective: Show detailed information about a scenario and allow the user to start a session.

Implementation Steps:

Create the page component:

Fetch the scenarioId from the URL params.

Call selectScenario(scenarioId) from usePracticeStore.

Display the full details of currentScenario from the store.

Include a prominent "Start Practice" button.

Start Session:

On button click, call startSession(scenarioId) from usePracticeStore.

Once the session is created successfully, navigate the user to the roleplay interface at /practice/sessions/:sessionId.

3.3. Roleplay Session Interface
File Location: src/pages/RoleplaySessionPage.tsx (new file)

Objective: Build the chat interface for the roleplay.

Implementation Steps:

Create the page component:

Fetch the sessionId from the URL.

Display the chat messages from usePracticeStore().messages.

Create a Message.tsx component to render user and AI messages differently.

Create a MessageInput.tsx component with a text input and a "Send" button.

Message Handling:

The "Send" button should call the sendMessage action from usePracticeStore.

The store will optimistically add the user's message to the state.

The AI's response will be received via the WebSocket (session:message event) and added to the store, triggering a re-render.

Ending the Session:

Add an "End Session" button that calls endSession() from the store.

When sessionEvaluation in the store is populated, display the results.

3.4. Session Evaluation
Objective: Display the performance feedback after a session ends.

Implementation Steps:

Create an EvaluationReport.tsx component.

This component takes the sessionEvaluation object as a prop.

Display the overall score, competency breakdown (a radar chart would be great here), strengths, and areas for improvement.

Conditionally render this component in RoleplaySessionPage.tsx when the session is complete.

4. Individual Development Plan (src/pages/IDPPage.tsx)
This page has a basic structure but needs its core functionality implemented.

4.1. Gap Analysis Wizard
Objective: Implement the multi-step process for a user to perform a gap analysis.

Implementation Steps:

Create GapAnalysisWizard.tsx:

This component will be shown in a Dialog when the user clicks "Start Gap Analysis".

Implement a stepper for the workflow:

Upload Competency Framework: A file upload zone for the framework PDF.

Upload Employee Data: A file upload zone for the employee performance PDF.

Review & Submit: Show file previews and a submit button.

API Integration:

The submit button will call performGapAnalysis from useIDPStore, passing the files.

Show a loading state (isAnalyzing) while the backend processes the data.

On success, close the dialog and update the state. The IDPPage will then show the results.

4.2. Displaying Gap Analysis & IDP
Objective: Flesh out the "Gap Analysis" and "Development Plan" tabs in IDPPage.tsx.

Implementation Steps:

Gap Analysis Tab:

When gapAnalysis is available in idpStore, display the results.

Create a GapAnalysisResults.tsx component to show the overall score, priority areas, and a list of competency gaps.

Include a "Generate Development Plan" button that calls generateIDP().

Development Plan Tab:

When currentIDP is available, display it.

Create an IDPView.tsx component.

Display the plan's goals in a list or timeline view.

Each goal should be expandable to show development activities and allow for progress updates.

Implement the logic for updateIDPGoal when a user interacts with a goal.

5. Progress & Profile Pages
5.1. Progress Page (src/pages/ProgressPage.tsx)
Objective: Visualize the user's learning and development progress.

Implementation Steps:

Fetch Data: Get progress data from learningStore, practiceStore, and idpStore.

Create Visualization Components:

Use a charting library like recharts to create:

A bar chart for "Modules Completed by Category".

A line chart for "Assessment Scores Over Time".

A radar chart for "Competency Growth" based on IDP and practice session data.

Display Achievements: Show a list of completed modules and earned badges.

5.2. Profile Page (src/pages/ProfilePage.tsx)
Objective: Allow users to view and update their profile information.

Implementation Steps:

Create ProfileForm.tsx:

Display user information from useAuthStore().user.

Allow editing of fields like "Name".

On submit, call updateProfile from authStore.

Account Settings:

Add a section for account settings, such as changing a password or managing notification preferences.

Include a "Logout" button that calls authStore.logout().