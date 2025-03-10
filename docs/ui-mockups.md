# UI Mockups

This document provides mockups and descriptions of the user interface components required to implement the user flows described in `user-flows.md`. Each section corresponds to a main screen or component set in the application.

## 1. Onboarding & Welcome Screens

### 1.1 Welcome Screen
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                     [App Logo]                      │
│                                                     │
│                    Quorum Chat                      │
│                                                     │
│  Chat with multiple LLMs in a round-table format    │
│                                                     │
│  • Compare responses from different models          │
│  • Create specialized expert panels                 │
│  • Facilitate model-to-model conversation           │
│                                                     │
│  Note: You'll need your own API keys to use this    │
│  application. Usage costs are determined by your    │
│  LLM provider agreements.                           │
│                                                     │
│                 [Get Started Button]                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 1.2 Consent & Privacy Modal
```
┌─────────────────────────────────────────────────────┐
│                Privacy & Consent                     │
│                                                     │
│  Your API keys will be stored in your browser's     │
│  localStorage unless you choose session-only        │
│  storage. Keys never leave your device or get sent  │
│  to our servers.                                    │
│                                                     │
│  Security implications:                             │
│  • Keys in localStorage persist between sessions    │
│  • Session-only storage is wiped when you close     │
│    your browser                                     │
│  • Your API usage is governed by provider terms     │
│                                                     │
│  [✓] I understand and agree to these terms          │
│                                                     │
│  [    Cancel    ]           [    Continue    ]      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 1.3 User Setup Screen
```
┌─────────────────────────────────────────────────────┐
│               Set Up Your Profile                    │
│                                                     │
│  Display Name (optional):                           │
│  ┌───────────────────────────────────────┐          │
│  │                                       │          │
│  └───────────────────────────────────────┘          │
│                                                     │
│  Configure API Keys:                                │
│                                                     │
│  OpenAI API Key:                                    │
│  ┌───────────────────────────────────────┐ [Help?]  │
│  │                                       │          │
│  └───────────────────────────────────────┘          │
│                                                     │
│  Anthropic API Key:                                 │
│  ┌───────────────────────────────────────┐ [Help?]  │
│  │                                       │          │
│  └───────────────────────────────────────┘          │
│                                                     │
│  Grok API Key:                                      │
│  ┌───────────────────────────────────────┐ [Help?]  │
│  │                                       │          │
│  └───────────────────────────────────────┘          │
│                                                     │
│  Storage Preference:                                │
│  (○) Remember my keys (localStorage)                │
│  (○) Session only (cleared when browser closes)     │
│                                                     │
│  [Skip for Now]            [Save and Continue]      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 2. API Key Management Screens

### 2.1 API Keys Settings Screen
```
┌─────────────────────────────────────────────────────┐
│               API Key Management                     │
│                                                     │
│  OpenAI API Key:                                    │
│  ┌───────────────────────────────────────┐          │
│  │ ••••••••••••••••••••••               │ [Test]    │
│  └───────────────────────────────────────┘ [Remove] │
│                                                     │
│  Anthropic API Key:                                 │
│  ┌───────────────────────────────────────┐          │
│  │ ••••••••••••••••••••••               │ [Test]    │
│  └───────────────────────────────────────┘ [Remove] │
│                                                     │
│  Grok API Key:                                      │
│  ┌───────────────────────────────────────┐          │
│  │ Not configured                        │ [Test]    │
│  └───────────────────────────────────────┘          │
│                                                     │
│  Storage Preference:                                │
│  [Toggle: localStorage ⟷ Session only]              │
│                                                     │
│  Note: Changing from localStorage to session-only   │
│  will remove your keys from persistent storage.     │
│                                                     │
│  [Cancel]                    [Save Changes]         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2.2 API Key Test Modal
```
┌─────────────────────────────────────────────────────┐
│               Testing API Key                        │
│                                                     │
│  [Spinner] Verifying OpenAI API key...              │
│                                                     │
│  ✓ Key format is valid                              │
│  ✓ Authentication successful                        │
│  ✓ API call completed                               │
│                                                     │
│  Your OpenAI API key is working correctly.          │
│                                                     │
│  Available models:                                  │
│  • gpt-4o                                          │
│  • gpt-4-turbo                                     │
│  • gpt-3.5-turbo                                   │
│                                                     │
│  [Close]                                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2.3 API Key Removal Confirmation
```
┌─────────────────────────────────────────────────────┐
│               Confirm Removal                        │
│                                                     │
│  Are you sure you want to remove your OpenAI API    │
│  key from this application?                         │
│                                                     │
│  This action cannot be undone, and you'll need to   │
│  enter your key again to use OpenAI models.         │
│                                                     │
│  [Cancel]                    [Remove Key]           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 3. Round Table Configuration

### 3.1 New Round Table Screen
```
┌─────────────────────────────────────────────────────┐
│           Configure Round Table                      │
│                                                     │
│  Select Participants:                               │
│  [✓] OpenAI                                         │
│  [✓] Anthropic                                      │
│  [ ] Grok                                           │
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ Participant 1: OpenAI                           ││
│  │                                                 ││
│  │ Display Name: [GPT-4o Expert                  ] ││
│  │ Model: [gpt-4o                     ▼]           ││
│  │ Role: [AI Assistant                           ] ││
│  │                                                 ││
│  │ System Prompt:                                  ││
│  │ ┌─────────────────────────────────────────────┐ ││
│  │ │You are an expert AI assistant. Answer       │ ││
│  │ │questions thoroughly and accurately.         │ ││
│  │ └─────────────────────────────────────────────┘ ││
│  │                                                 ││
│  │ [Advanced Settings ▼]                           ││
│  │                                                 ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ Participant 2: Anthropic                        ││
│  │                                                 ││
│  │ Display Name: [Claude Analyst                 ] ││
│  │ Model: [claude-3.7-sonnet           ▼]           ││
│  │ Role: [Data Analyst                          ] ││
│  │                                                 ││
│  │ System Prompt:                                  ││
│  │ ┌─────────────────────────────────────────────┐ ││
│  │ │You are a data analysis expert. Focus on     │ ││
│  │ │patterns, statistics, and insights from data.│ ││
│  │ └─────────────────────────────────────────────┘ ││
│  │                                                 ││
│  │ [Advanced Settings ▼]                           ││
│  │                                                 ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  [+ Add Participant]                                │
│                                                     │
│  [Save as Template]  [Load Template]  [Create Now]  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3.2 Advanced LLM Settings Panel
```
┌─────────────────────────────────────────────────────┐
│          Advanced Settings: GPT-4o Expert            │
│                                                     │
│  Temperature: 0.7                                   │
│  ├───────────────[●]──────────────┤                 │
│  0 (Deterministic)               1 (Creative)       │
│                                                     │
│  Max Tokens: 1000                                   │
│  ├───────[●]──────────────────────┤                 │
│  100                            4000                │
│                                                     │
│  Top-p: 0.9                                         │
│  ├────────────────────[●]─────────┤                 │
│  0.1                             1                  │
│                                                     │
│  Frequency Penalty: 0                               │
│  ├──[●]─────────────────────────┤                  │
│  -2                             2                   │
│                                                     │
│  Presence Penalty: 0                                │
│  ├──[●]─────────────────────────┤                  │
│  -2                             2                   │
│                                                     │
│  [Reset to Defaults]            [Apply]             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3.3 Template Management
```
┌─────────────────────────────────────────────────────┐
│               Load Template                          │
│                                                     │
│  Select a saved template:                           │
│                                                     │
│  ○ Expert Panel                                     │
│    (OpenAI, Anthropic, Grok)                        │
│                                                     │
│  ○ Medical Consultation                             │
│    (OpenAI, Anthropic)                              │
│                                                     │
│  ○ Code Review                                      │
│    (OpenAI, Anthropic)                              │
│                                                     │
│  ○ Content Brainstorming                            │
│    (OpenAI, Anthropic, Grok)                        │
│                                                     │
│  [Manage Templates]            [Load Selected]      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 4. Chat Interface

### 4.1 Main Chat Screen
```
┌─────────────────────────────────────────────────────┐
│ [Settings] [New Chat] [Export] [Clear]    [Profile] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Round Table: Expert Panel       [Edit Participants]│
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ You (12:34 PM)                                  ││
│  │                                                 ││
│  │ What are the ethical implications of using AI   ││
│  │ for content moderation on social platforms?     ││
│  │                                                 ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ GPT-4o Expert (12:35 PM)                        ││
│  │                                                 ││
│  │ The ethical implications of using AI for content││
│  │ moderation on social platforms are multifaceted:││
│  │                                                 ││
│  │ 1. Bias and fairness: AI systems can inherit    ││
│  │ biases from training data, potentially leading  ││
│  │ to unfair treatment of certain groups...        ││
│  │                                                 ││
│  │ [Show more]                     [⚙️ Settings]   ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ Claude Analyst (12:36 PM)                       ││
│  │                                                 ││
│  │ [Thinking...]                                   ││
│  │                                                 ││
│  │ [Stop Generation]                               ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ [Message input field                          ] ││
│  │ [Summarize] [Regenerate]             [Send →]   ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4.2 Participant Quick Edit Panel
```
┌─────────────────────────────────────────────────────┐
│       Quick Edit: GPT-4o Expert                      │
│                                                     │
│  Display Name: [GPT-4o Expert                     ] │
│                                                     │
│  Role:         [Ethics Specialist                 ] │
│                                                     │
│  System Prompt:                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │You are an AI ethics expert. Analyze ethical   │  │
│  │implications thoroughly and consider multiple   │  │
│  │perspectives. Highlight potential biases and    │  │
│  │concerns in technology applications.           │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  [Advanced Settings]                                │
│                                                     │
│  [Cancel]                    [Apply Changes]        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4.3 Conversation Summary Card
```
┌─────────────────────────────────────────────────────┐
│                   Summary                            │
│                                                     │
│  Topic: AI for content moderation ethics            │
│                                                     │
│  Key Points Discussed:                              │
│  • Bias and fairness in AI moderation systems       │
│  • Transparency vs. opacity in moderation decisions │
│  • Human oversight and accountability               │
│  • Scale and consistency challenges                 │
│  • Cultural context and global perspectives         │
│                                                     │
│  Perspectives:                                      │
│  • GPT-4o Expert: Emphasized technical limitations  │
│    and the need for human-in-the-loop approaches    │
│  • Claude Analyst: Focused on measurement metrics   │
│    and quantifiable impacts on different groups     │
│                                                     │
│  [Generated by AI - May miss context]               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 5. Settings Screens

### 5.1 Main Settings Screen
```
┌─────────────────────────────────────────────────────┐
│                    Settings                          │
│                                                     │
│  ┌─────────────────┐ ┌─────────────────────────────┐│
│  │                 │ │                             ││
│  │    API Keys     │ │ Display Name:               ││
│  │                 │ │ [User123                  ] ││
│  │   Appearance    │ │                             ││
│  │                 │ │ Theme:                      ││
│  │  LLM Defaults   │ │ (○) Light  (●) Dark         ││
│  │                 │ │                             ││
│  │ Saved Templates │ │ Accent Color:               ││
│  │                 │ │ [Blue       ▼]              ││
│  │    Privacy      │ │                             ││
│  │                 │ │ Round Table Behavior:       ││
│  │    Help         │ │ [✓] Auto-advance to next LLM││
│  │                 │ │ [✓] Show thinking indicators││
│  │                 │ │ [ ] Auto-summarize after    ││
│  │                 │ │     10 exchanges            ││
│  │                 │ │                             ││
│  │                 │ │                             ││
│  │                 │ │                             ││
│  │                 │ │                             ││
│  │                 │ │                             ││
│  └─────────────────┘ └─────────────────────────────┘│
│                                                     │
│  [Reset to Defaults]            [Save Changes]      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5.2 LLM Defaults Screen
```
┌─────────────────────────────────────────────────────┐
│                LLM Default Settings                  │
│                                                     │
│  These settings will be applied to new round tables │
│  unless overridden during configuration.            │
│                                                     │
│  OpenAI Defaults:                                   │
│  Model: [gpt-4o                     ▼]              │
│  Temperature: 0.7   ├─────────[●]───────────┤       │
│  Max Tokens: 1000   ├───[●]─────────────────┤       │
│                                                     │
│  Anthropic Defaults:                                │
│  Model: [claude-3.7-sonnet           ▼]              │
│  Temperature: 0.7   ├─────────[●]───────────┤       │
│  Max Tokens: 1000   ├───[●]─────────────────┤       │
│                                                     │
│  Grok Defaults:                                     │
│  Model: [grok-1                     ▼]              │
│  Temperature: 0.7   ├─────────[●]───────────┤       │
│  Max Tokens: 1000   ├───[●]─────────────────┤       │
│                                                     │
│  [Reset to Defaults]            [Save Changes]      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5.3 Privacy Settings Screen
```
┌─────────────────────────────────────────────────────┐
│                  Privacy Settings                    │
│                                                     │
│  Data Storage Location:                             │
│  (●) Local device only (localStorage/sessionStorage)│
│  (○) Include browser session storage                │
│                                                     │
│  API Key Storage:                                   │
│  (○) Remember keys between sessions (localStorage)  │
│  (●) Session only (cleared when browser closes)     │
│                                                     │
│  Conversation History:                              │
│  [✓] Save conversation history                      │
│  [ ] Anonymize my messages in saved conversations   │
│                                                     │
│  [Clear Saved API Keys]                             │
│  [Clear Conversation History]                       │
│  [Clear All Application Data]                       │
│                                                     │
│  [Cancel]                    [Save Changes]         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 6. Error States & Notifications

### 6.1 API Error Notification
```
┌─────────────────────────────────────────────────────┐
│               API Key Error                          │
│                                                     │
│  ⚠️ Your OpenAI API key appears to be invalid or    │
│  has expired.                                       │
│                                                     │
│  Error details: "Authentication error: Invalid API   │
│  key provided."                                     │
│                                                     │
│  [Update API Key]             [Dismiss]             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 6.2 Rate Limit Error
```
┌─────────────────────────────────────────────────────┐
│              Rate Limit Exceeded                     │
│                                                     │
│  ⚠️ The rate limit for Anthropic API has been       │
│  exceeded.                                          │
│                                                     │
│  We recommend waiting a minute before trying again. │
│  If this persists, you may need to check your API   │
│  tier limits.                                       │
│                                                     │
│  [Auto-retry in: 45s]         [Dismiss]             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 6.3 Network Error
```
┌─────────────────────────────────────────────────────┐
│              Network Error                           │
│                                                     │
│  ⚠️ A network error occurred while communicating    │
│  with the API server.                               │
│                                                     │
│  Please check your internet connection.             │
│                                                     │
│  [Retry Now]                  [Dismiss]             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 7. Import/Export Dialogs

### 7.1 Export Dialog
```
┌─────────────────────────────────────────────────────┐
│              Export Conversation                     │
│                                                     │
│  Select export format:                              │
│  (●) Text transcript (.txt)                         │
│  (○) JSON with metadata (.json)                     │
│  (○) HTML with formatting (.html)                   │
│                                                     │
│  Export options:                                    │
│  [✓] Include system prompts                         │
│  [✓] Include participant configurations             │
│  [ ] Include timestamps                             │
│                                                     │
│  [Cancel]                    [Export]               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 7.2 Import Dialog
```
┌─────────────────────────────────────────────────────┐
│              Import Conversation                     │
│                                                     │
│  Select file to import:                             │
│  [Browse for file...                  ]             │
│                                                     │
│  Import options:                                    │
│  (●) Create new round table with same configuration │
│  (○) Replace current conversation                   │
│                                                     │
│  Warning: Importing will use your API keys for any  │
│  future messages in this conversation.              │
│                                                     │
│  [Cancel]                    [Import]               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 8. Help & Support Components

### 8.1 Help Center
```
┌─────────────────────────────────────────────────────┐
│                   Help Center                        │
│                                                     │
│  ┌─────────────────┐ ┌─────────────────────────────┐│
│  │                 │ │                             ││
│  │ Getting Started │ │ Getting Started with Quorum ││
│  │                 │ │                             ││
│  │      FAQ        │ │ This guide will help you    ││
│  │                 │ │ set up and use the Quorum   ││
│  │   API Keys      │ │ round-table chat system.    ││
│  │                 │ │                             ││
│  │ Troubleshooting │ │ 1. Setting Up API Keys      ││
│  │                 │ │ To use Quorum, you'll need  ││
│  │   Templates     │ │ at least one API key from   ││
│  │                 │ │ supported providers:        ││
│  │ Advanced Usage  │ │                             ││
│  │                 │ │ • OpenAI                    ││
│  │                 │ │ • Anthropic                 ││
│  │                 │ │ • Grok                      ││
│  │                 │ │                             ││
│  │                 │ │ You can obtain these keys   ││
│  │                 │ │ from their respective       ││
│  │                 │ │ websites...                 ││
│  │                 │ │                             ││
│  └─────────────────┘ └─────────────────────────────┘│
│                                                     │
│  [Close]                                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 8.2 Report Issue Form
```
┌─────────────────────────────────────────────────────┐
│                  Report an Issue                     │
│                                                     │
│  Issue type:                                        │
│  [UI Problem              ▼]                        │
│                                                     │
│  Description:                                       │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │                                               │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Steps to reproduce:                                │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Include diagnostic information:                    │
│  [✓] Browser details                                │
│  [✓] Application version                            │
│  [ ] Conversation logs (no API keys included)       │
│                                                     │
│  [Cancel]                    [Submit Report]        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 9. Mobile Responsive Designs

### 9.1 Mobile Chat Interface
```
┌─────────────────────────┐
│ [≡] Quorum Chat    [⚙️] │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │ You (12:34 PM)      │ │
│ │                     │ │
│ │ What are the ethical│ │
│ │ implications of AI  │ │
│ │ for content         │ │
│ │ moderation?         │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ GPT-4o (12:35 PM)   │ │
│ │                     │ │
│ │ The ethical         │ │
│ │ implications of AI  │ │
│ │ for content         │ │
│ │ moderation include: │ │
│ │                     │ │
│ │ 1. Bias and fairness│ │
│ │ 2. Transparency     │ │
│ │ 3. Accountability   │ │
│ │                     │ │
│ │ [Show more]   [⚙️]  │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Claude (Thinking...)│ │
│ │                     │ │
│ │ [Stop]              │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ [Message input    ] │ │
│ │ [📝]          [➤]   │ │
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

### 9.2 Mobile Settings Menu
```
┌─────────────────────────┐
│ [×] Settings            │
├─────────────────────────┤
│                         │
│ • API Keys              │
│                         │
│ • Appearance            │
│                         │
│ • LLM Defaults          │
│                         │
│ • Saved Templates       │
│                         │
│ • Privacy               │
│                         │
│ • Help & Support        │
│                         │
│                         │
│ [Sign Out]              │
│                         │
└─────────────────────────┘
```

## 10. Component Library

This section outlines the core reusable components that will be used throughout the application.

### 10.1 Message Bubble Component
- User variant (right-aligned)
- AI variant (left-aligned with model name and icon)
- System message variant (centered, lighter background)
- Loading/thinking state
- Error state
- Expandable/collapsible for long messages
- Action buttons (regenerate, copy, etc.)

### 10.2 Input Components
- Text input (single line)
- Text area (multi-line)
- Slider (for numeric values)
- Toggle switch
- Radio button group
- Checkbox group
- Dropdown select

### 10.3 Button Components
- Primary action
- Secondary action
- Tertiary/text button
- Icon button
- Loading state
- Disabled state

### 10.4 Dialog/Modal Components
- Standard modal (with title, content, actions)
- Confirmation modal
- Settings panel
- Tooltip
- Contextual help

### 10.5 Navigation Components
- Sidebar/drawer
- Tab bar
- Breadcrumbs
- Pagination

### 10.6 Notification Components
- Toast notification (success, error, warning, info)
- Badge
- Alert banner

### 10.7 Layout Components
- Card
- List
- Grid
- Divider
- Accordion
- Tabs

This UI mockups document provides a comprehensive foundation for implementing the user interface components needed to support the user flows outlined in the user-flows.md document. The mockups are designed to be responsive, accessible, and follow modern UI/UX best practices. 