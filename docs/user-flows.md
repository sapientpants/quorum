# User Flows

This document outlines the key user flows that implement the features described in `features.md`. Each flow represents a sequence of actions and screens that users will navigate through when using the application.

## 1. First-Time User Onboarding

### 1.1 Welcome & Introduction

1. User visits the application for the first time
2. System displays welcome screen with:
   - App description ("Chat with multiple LLMs in a round-table conversation")
   - Key features overview
   - Disclaimers about API key usage and costs
   - "Get Started" button

### 1.2 Consent & Privacy Notice

1. User clicks "Get Started"
2. System displays consent modal with:
   - Information about API key storage (localStorage)
   - Security implications
   - Privacy policy highlights
3. User checks "I understand and agree" checkbox
4. User clicks "Continue"

### 1.3 Initial Setup

1. System prompts user to enter display name (optional)
2. System presents API key setup screen with:
   - Input fields for each supported LLM (OpenAI, Anthropic, Grok, Google, etc.)
   - Help text explaining how to obtain each key
   - Links to provider documentation
   - Storage preference toggle (localStorage vs. session-only vs. none)
3. User enters at least one API key
4. User clicks "Save and Continue"
5. System validates key format
6. System redirects to the Participants page to set up AI participants

### 1.4 Returning User Experience

1. Returning user visits the application
2. System checks for existing API keys based on storage preference:
   - If keys are stored, system bypasses API key setup
   - If using session storage and session is expired, prompts for keys again
   - If using "No Storage" option, always prompts for keys
3. System restores:
   - User preferences and settings
   - Last active conversation (if available)
   - Saved templates and participants
4. System offers quick access to recent conversations
5. User can choose to continue previous session or start fresh

## 2. API Key Management

### 2.1 Adding/Updating API Keys

1. User navigates to Settings > API Keys
2. System displays current API key status for each provider:
   - Masked keys if already stored
   - Empty fields if not configured
3. User enters or updates API keys
4. User selects storage preference (localStorage, session-only, or none)
5. User clicks "Save Changes"
6. System validates and stores keys
7. System confirms successful update

### 2.2 Testing API Keys

1. From API Keys screen, user clicks "Test Key" next to a provider
2. System makes a minimal API call to verify the key works
3. System displays success or error message
4. If error, system provides guidance on how to fix the issue

## 3. Theme Customization

### 3.1 Changing Theme

1. User clicks on theme toggle button in the top navigation bar
2. System immediately toggles between light and dark themes
3. System stores theme preference in localStorage for future visits

### 3.2 Accessibility Theme Options

1. User with accessibility needs navigates to Settings > Appearance
2. System provides specialized accessibility options:
   - High contrast mode
   - Large text mode
   - Reduced motion settings
   - Color blindness accommodations
3. User selects appropriate options
4. System applies settings immediately and saves preferences
5. System shows visual confirmation of applied settings

## 4. Participant Configuration

### 4.1 Creating a New Participant

1. User navigates to Settings > Participants or clicks "Add Participant" in the round table
2. System displays participant form with:
   - Name input
   - Provider selection (OpenAI, Anthropic, Grok, Google)
   - Model selection (based on selected provider)
   - Role description input
   - System prompt textarea
   - Advanced settings (temperature, max tokens)
3. User fills out the form
4. User clicks "Create Participant"
5. System validates the form
6. System creates the participant and adds it to the round table
7. System confirms successful creation

### 4.2 Editing a Participant

1. User clicks "Edit" on an existing participant
2. System displays participant form pre-filled with current values
3. User makes changes
4. User clicks "Save Changes"
5. System validates the form
6. System updates the participant
7. System confirms successful update

### 4.3 Deleting a Participant

1. User clicks "Delete" on an existing participant
2. System displays confirmation dialog
3. User confirms deletion
4. System removes the participant
5. System confirms successful deletion

### 4.4 Reordering Participants

1. User drags a participant in the round table or participant list
2. System shows visual feedback during drag
3. User drops the participant in a new position
4. System reorders the participants
5. System confirms successful reordering

### 4.5 Configuring the Facilitator

1. User accesses the Participant List
2. System displays the mandatory Facilitator role at the top
3. User selects an LLM provider and model from the dropdown
4. System displays available models based on the user's API keys
5. User can configure facilitator-specific settings:
   - Specialized system prompt for facilitation
   - Conversation management style (directive vs. supportive)
   - Turn allocation preferences
   - Summarization frequency
6. User saves facilitator settings
7. System confirms the facilitator is configured and ready
8. If user attempts to start a conversation without a facilitator, system prompts to configure one first

### 4.6 Customizing User's Own Role

1. User accesses their own participant card in the Participant List
2. System displays editable fields for:
   - Display name
   - Role description (e.g., "Product Manager", "Subject Matter Expert")
3. User updates their information
4. User sets participation preferences:
   - Auto-advance after sending message
   - Notification when it's their turn
5. System saves user role configuration
6. System applies these settings in current and future conversations

## 5. Round Table Conversation

### 5.1 Starting a Conversation

1. User navigates to the Chat page
2. System displays the round table with configured participants
3. User enters a message in the input field
4. User clicks "Send" or presses Enter
5. System displays the user's message in the chat
6. System automatically triggers the next participant in the round table

### 5.2 AI Participant Turn Management

1. When it's an AI participant's turn, system:
   - Highlights the active participant in the round table
   - Shows "Thinking..." indicator
   - Calls the appropriate LLM API with conversation history
   - Displays streaming response if supported
   - Shows complete response when finished
2. System automatically advances to the next participant
3. User can intervene in the turn sequence by:
   - Clicking "Skip" to bypass current participant
   - Clicking "Pause Auto-Advance" to stop automatic progression
   - Manually selecting the next participant to speak out of order
   - Using "Priority Mode" to promote specific participants in the queue
4. Facilitator AI manages conversation by:
   - Distributing turns fairly among participants
   - Inviting quieter participants to contribute
   - Identifying and resolving tangents or circular discussions
   - Providing transitions between topics
5. User can adjust turn timeout settings mid-conversation
6. System provides visual indicators of turn sequence and waiting participants

### 5.3 Handling Errors

1. If an API call fails during an AI participant's turn:
   - System displays error message
   - System provides retry option
   - System allows skipping the participant's turn
2. User can choose to retry or skip
3. System continues the conversation flow

### 5.4 Mobile Round Table Interaction

1. On mobile devices, user accesses the round table via the "Round Table" tab
2. System adapts the visualization to mobile screen size
3. User can:
   - Tap a participant to see their details
   - Long-press to access quick edit options
   - Use swipe gestures to advance turns manually
   - Toggle between compact and expanded views
4. System automatically scrolls to show active participant
5. System provides haptic feedback for turn transitions
6. User can access the same functionality as desktop with optimized touch controls

## 6. Templates Management

### 6.1 Using a Template

1. User navigates to Templates page
2. System displays list of available templates
3. User selects a template
4. System displays template details and preview
5. User clicks "Use Template"
6. System loads the template configuration
7. System redirects to Participants page with configured participants

### 6.2 Creating a Template

1. After configuring participants, user clicks "Save as Template"
2. System displays template form with:
   - Name input
   - Description textarea
   - Participant list preview
3. User fills out the form
4. User clicks "Save Template"
5. System validates the form
6. System creates the template
7. System confirms successful creation

### 6.3 Sharing a Template

1. User selects a template
2. User clicks "Export"
3. System generates a JSON file
4. User downloads the file
5. User can share the file with others

### 6.4 Importing a Template

1. User clicks "Import Template"
2. System displays file upload dialog
3. User selects a template JSON file
4. System validates the file
5. System imports the template
6. System confirms successful import

### 6.5 Collaborative Template Management

1. User selects a template and clicks "Share"
2. System generates a unique sharing URL
3. User sends the URL to collaborators
4. Collaborators can:
   - View the template configuration
   - Create a copy for their own use
   - Suggest modifications (if permission granted)
5. Template owner receives modification suggestions
6. Owner can approve or reject changes
7. System maintains version history of collaborative templates
8. Multiple users can combine their expertise to create optimized templates

## 7. Conversation Management

### 7.1 Exporting a Conversation

1. During or after a conversation, user clicks "Export"
2. System displays export options (JSON, Text, Markdown)
3. User selects format
4. System generates the export file
5. User downloads the file

### 7.2 Clearing a Conversation

1. User clicks "Clear Conversation"
2. System displays confirmation dialog
3. User confirms
4. System clears the conversation history
5. System resets the round table

### 7.3 Conversation Analysis

1. User clicks "Analyze Conversation"
2. System offers analysis options:
   - Basic summary (key points, topics covered)
   - Detailed analysis (sentiment, participant engagement, insight extraction)
   - Comparison with previous conversations
   - Action item extraction
3. User selects desired analysis type
4. System processes the conversation using a dedicated analysis model
5. System presents analysis with:
   - Visual data presentation (charts, heatmaps)
   - Text summaries of key findings
   - Clickable sections to view relevant conversation parts
6. User can save or export the analysis
7. System offers suggestions for improving future conversations based on patterns
8. User can apply learned insights to participant configurations

### 7.4 Performance Under Network Constraints

1. System continuously monitors network conditions
2. If connection quality degrades:
   - System displays network status indicator
   - System prioritizes essential operations
   - System implements graceful degradation:
     - Reducing streaming updates
     - Simplifying UI elements
     - Caching inputs for later synchronization
3. If connection is lost:
   - System saves current state locally
   - System shows offline mode notification
   - User can continue viewing content but not generate new AI responses
4. When connection is restored:
   - System resynchronizes with server
   - System completes pending operations
   - System notifies user of restored functionality
5. User can manually enable "Low Bandwidth Mode" for slower connections

## 8. Language Selection and Management

### 8.1 Automatic Language Detection

1. User visits the application for the first time
2. System checks for language preference in the following order:
   - Looks for a 'preferredLanguage' cookie
   - Falls back to the browser's `Accept-Language` header
   - Defaults to English if neither source provides a valid language
3. System applies the detected language to the UI

### 8.2 Manual Language Selection

1. User navigates to Settings > Preferences
2. System displays language dropdown with available options:
   - English
   - Spanish
   - French
   - German
   - Chinese
   - Japanese
   - Arabic
   - Russian
   - (Other supported languages)
3. User selects desired language
4. System immediately applies the selected language to the UI
5. System stores the language preference in a cookie for future visits

### 8.3 RTL Language Handling

1. User selects a right-to-left language (e.g., Arabic)
2. System:
   - Changes text direction to RTL
   - Flips UI layout (menus, buttons, etc.)
   - Adjusts alignment of text and components
3. User interacts with the RTL-optimized interface
4. When user switches back to a LTR language, system reverts to standard layout

## 9. Settings & Customization

### 9.1 Changing Theme

1. User navigates to Settings > Appearance
2. User toggles between light/dark mode
3. System applies changes immediately
4. System stores the theme preference for future visits

### 9.2 Adjusting LLM Parameters

1. User navigates to Settings > LLM Defaults
2. User configures default parameters for each provider:
   - Temperature
   - Max tokens
   - Top-p
   - Presence penalty
   - Frequency penalty
3. User clicks "Save Defaults"
4. System applies these defaults to new round table configurations

### 9.3 Managing Saved Templates

1. User navigates to Settings > Saved Templates
2. System displays list of saved round table configurations
3. User can rename, delete, or set a template as default
4. Changes are saved automatically

### 9.4 Accessibility Settings

1. User navigates to Settings > Accessibility
2. System displays options for:
   - Screen reader optimization
   - Keyboard navigation enhancements
   - Motion reduction
   - Text size adjustments
   - Color contrast settings
   - Alternative input methods
3. User configures desired accessibility options
4. System applies settings immediately
5. System provides immediate feedback about the changes
6. User can test the settings with a preview area
7. System stores accessibility preferences for future sessions

## 10. Error Handling Flows

### 10.1 API Key Error

1. System attempts to call LLM API with stored key
2. API returns authentication error
3. System displays error message in chat
4. System provides quick link to update API key
5. User clicks link to navigate to API key settings
6. User updates key and returns to conversation
7. User can retry the failed message

### 10.2 Rate Limit Exceeded

1. System attempts to call LLM API
2. API returns rate limit error
3. System displays appropriate error message
4. System suggests waiting period before retry
5. User can manually retry after waiting period

### 10.3 Network Error

1. System attempts to call LLM API
2. Network request fails
3. System displays connection error message
4. System offers automatic retry option
5. User clicks "Retry" or waits for automatic retry
6. When connection is restored, conversation continues

## 11. Round Table Visualization

### 11.1 Customizing the Round Table Layout

1. User accesses the Round Table view
2. User clicks "Customize Layout"
3. System provides visualization options:
   - Circular arrangement (default)
   - Linear sequence
   - Hierarchical structure
   - Custom positioning
4. User selects preferred layout
5. User can drag participants to fine-tune positions
6. System displays preview of changes in real-time
7. User saves custom layout
8. System applies the layout to current and future conversations

### 11.2 Conversation Flow Visualization

1. During an active conversation, the Round Table displays:
   - Directional indicators showing message flow
   - Participant activity levels via visual cues
   - Current speaker highlight
   - Queued speakers indication
2. User can click "Show Conversation Patterns" to view:
   - Interaction frequency between specific participants
   - Topic clustering visualization
   - Turn-taking patterns over time
3. System updates visualizations in real-time as conversation progresses
4. User can toggle between simplified and detailed visualizations
5. System provides insights about conversation dynamics
6. User can export visualization snapshots

## 12. Feedback & Support

### 12.1 Reporting Issues

1. User encounters problem
2. User clicks "Report Issue" in footer or settings
3. System displays feedback form
4. User describes issue and submits form
5. System confirms receipt of feedback
6. System provides troubleshooting suggestions if applicable

### 12.2 Accessing Help

1. User clicks "Help" or "?" icon
2. System displays help center with:
   - Getting started guide
   - FAQ
   - API key tutorials
   - Troubleshooting tips
3. User navigates help content
4. User can return to application at any point

## 13. Keyboard and Voice Accessibility

### 13.1 Keyboard Navigation

1. User accesses the application using keyboard only
2. System provides comprehensive keyboard shortcuts:
   - Tab navigation between interactive elements
   - Arrow keys to navigate round table
   - Shortcut keys for common actions (e.g., Ctrl+Enter to send)
   - Focus indicators showing current selection
3. User presses "?" to view keyboard shortcut guide
4. System displays overlay with all available shortcuts
5. User can customize keyboard shortcuts in Settings
6. System ensures all functionality is accessible via keyboard

### 13.2 Voice Control

1. User enables voice control in Accessibility settings
2. System activates voice command listener
3. User can:
   - Dictate messages using speech-to-text
   - Navigate the interface with voice commands
   - Control round table interactions verbally
   - Access all core functionality via voice
4. System provides voice feedback for command recognition
5. System offers voice command guide for reference
6. User can combine voice and traditional inputs seamlessly
