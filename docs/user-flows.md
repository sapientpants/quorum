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
   - Input fields for each supported LLM (OpenAI, Anthropic, Grok, etc.)
   - Help text explaining how to obtain each key
   - Links to provider documentation
   - Storage preference toggle (localStorage vs. session-only)
3. User enters at least one API key
4. User clicks "Save and Continue"
5. System validates key format
6. System redirects to main chat interface

## 2. API Key Management

### 2.1 Adding/Updating API Keys
1. User navigates to Settings > API Keys
2. System displays current API key status for each provider:
   - Masked keys if already stored
   - Empty fields if not configured
3. User enters or updates API keys
4. User selects storage preference (localStorage or session-only)
5. User clicks "Save Changes"
6. System validates and stores keys
7. System confirms successful update

### 2.2 Testing API Keys
1. From API Keys screen, user clicks "Test Key" next to a provider
2. System makes a minimal API call to verify key validity
3. System displays success or error message
4. If error, system provides troubleshooting guidance

## 3. Language Selection and Management

### 3.1 Automatic Language Detection
1. User visits the application for the first time
2. System checks for language preference in the following order:
   - Looks for a 'preferredLanguage' cookie
   - Falls back to the browser's `Accept-Language` header
   - Defaults to English if neither source provides a valid language
3. System applies the detected language to the UI

### 3.2 Manual Language Selection
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

### 3.3 RTL Language Handling
1. User selects a right-to-left language (e.g., Arabic)
2. System:
   - Changes text direction to RTL
   - Flips UI layout (menus, buttons, etc.)
   - Adjusts alignment of text and components
3. User interacts with the RTL-optimized interface
4. When user switches back to a LTR language, system reverts to standard layout

## 4. Round Table Configuration

### 4.1 Creating a New Round Table
1. User clicks "New Round Table" from dashboard or chat interface
2. System displays participant configuration screen
3. User toggles desired LLM participants on/off
4. For each active LLM, user configures:
   - Display name
   - Model selection (e.g., gpt-4o, claude-3.7-sonnet)
   - Role description (e.g., "Medical Expert")
   - System prompt (instructions for the LLM's persona)
   - Advanced settings (temperature, max tokens, etc.)
5. User arranges participant order via drag-and-drop interface
6. User clicks "Save Configuration"
7. System creates new round table session
8. System redirects to chat interface with configured participants

### 4.2 Saving a Round Table Configuration
1. From participant configuration screen, user clicks "Save as Template"
2. System prompts for template name
3. User enters name (e.g., "Expert Panel")
4. User clicks "Save"
5. System stores configuration as a reusable template

### 4.3 Loading a Saved Configuration
1. User clicks "Load Template" from participant configuration screen
2. System displays list of saved templates
3. User selects desired template
4. System populates configuration fields with template values
5. User can modify settings if needed
6. User clicks "Create Round Table"
7. System creates new session with selected configuration

## 5. Chat Interaction

### 5.1 Starting a Conversation
1. User enters initial message in input field
2. User clicks "Send" or presses Enter
3. System displays user message in chat interface
4. System automatically triggers first LLM participant in the round-robin sequence
5. System displays "Thinking..." indicator for active LLM
6. System receives and displays LLM response
7. System automatically triggers next LLM in sequence
8. Process continues until all LLMs have responded
9. System indicates it's the user's turn again

### 5.2 Continuing the Conversation
1. User sees indicator that it's their turn
2. User enters next message
3. Round-robin sequence repeats with all active LLMs
4. Visual indicators show whose turn it is throughout the process

### 5.3 Modifying Participant Mid-Conversation
1. User clicks on participant settings icon
2. System displays quick edit panel for that participant
3. User modifies settings (role, system prompt, etc.)
4. User clicks "Apply Changes"
5. System updates participant configuration for subsequent turns
6. Conversation continues with updated settings

## 6. Conversation Management

### 6.1 Clearing Conversation
1. User clicks "Clear Chat" button
2. System prompts for confirmation
3. User confirms action
4. System clears all messages while maintaining participant configuration
5. User can start a new conversation with same participants

### 6.2 Summarizing Conversation
1. As conversation grows, user clicks "Summarize So Far"
2. System calls an LLM to generate a summary of the conversation
3. System inserts summary as a special message in the chat
4. System optionally compresses older messages to reduce token usage
5. Conversation continues with summarized context

### 6.3 Exporting Conversation
1. User clicks "Export" button
2. System offers format options (JSON, text transcript)
3. User selects desired format
4. System generates export file
5. Browser downloads file to user's device

### 6.4 Importing Conversation
1. User clicks "Import" button
2. System displays file selector
3. User selects previously exported conversation file
4. System validates file format
5. System loads conversation history and participant configuration
6. User can continue the imported conversation

## 7. Settings & Customization

### 7.1 Changing Theme
1. User navigates to Settings > Appearance
2. User toggles between light/dark mode
3. User selects color scheme preferences
4. System applies changes immediately
5. User clicks "Save as Default" to persist preferences

### 7.2 Adjusting LLM Parameters
1. User navigates to Settings > LLM Defaults
2. User configures default parameters for each provider:
   - Temperature
   - Max tokens
   - Top-p
   - Presence penalty
   - Frequency penalty
3. User clicks "Save Defaults"
4. System applies these defaults to new round table configurations

### 7.3 Managing Saved Templates
1. User navigates to Settings > Saved Templates
2. System displays list of saved round table configurations
3. User can rename, delete, or set a template as default
4. Changes are saved automatically

## 8. Error Handling Flows

### 8.1 API Key Error
1. System attempts to call LLM API with stored key
2. API returns authentication error
3. System displays error message in chat
4. System provides quick link to update API key
5. User clicks link to navigate to API key settings
6. User updates key and returns to conversation
7. User can retry the failed message

### 8.2 Rate Limit Exceeded
1. System attempts to call LLM API
2. API returns rate limit error
3. System displays appropriate error message
4. System suggests waiting period before retry
5. User can manually retry after waiting period

### 8.3 Network Error
1. System attempts to call LLM API
2. Network request fails
3. System displays connection error message
4. System offers automatic retry option
5. User clicks "Retry" or waits for automatic retry
6. When connection is restored, conversation continues

## 9. Security & Privacy Flows

### 9.1 Clearing Stored Data
1. User navigates to Settings > Privacy
2. User clicks "Clear All Data"
3. System displays confirmation with details of what will be removed:
   - Stored API keys
   - Conversation history
   - Saved templates
   - User preferences
4. User confirms action
5. System removes all data from localStorage/sessionStorage
6. System confirms successful data removal

### 9.2 Changing Key Storage Preference
1. User navigates to Settings > API Keys
2. User toggles storage preference from localStorage to session-only (or vice versa)
3. System displays implications of the change
4. User confirms change
5. System updates storage mechanism for all keys
6. System confirms successful update

## 10. Feedback & Support

### 10.1 Reporting Issues
1. User encounters problem
2. User clicks "Report Issue" in footer or settings
3. System displays feedback form
4. User describes issue and submits form
5. System confirms receipt of feedback
6. System provides troubleshooting suggestions if applicable

### 10.2 Accessing Help
1. User clicks "Help" or "?" icon
2. System displays help center with:
   - Getting started guide
   - FAQ
   - API key tutorials
   - Troubleshooting tips
3. User navigates help content
4. User can return to application at any point 