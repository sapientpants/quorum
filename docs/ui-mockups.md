# UI Mockups Corresponding to Main User Flows

This document contains UI mockups for the screens needed to implement the user flows described in `user-flows.md`. Each mockup represents a key screen in the application's interface.

## 1. First-Time User Onboarding

### 1.1 Welcome Screen

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                      Quorum                         │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │       [Icon: Round Table with Chairs]       │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Chat with multiple LLMs in a round-table format    │
│                                                     │
│  • Create custom AI participants with specific roles │
│  • Facilitate natural multi-model conversations     │
│  • Save and share your favorite configurations      │
│  • Analyze conversation patterns and insights       │
│                                                     │
│  Note: Requires API keys from LLM providers.        │
│  Usage may incur costs based on provider pricing.   │
│                                                     │
│  [           Get Started           ]                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 1.2 Consent Modal

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              API Keys & Privacy Notice              │
│                                                     │
│  Quorum requires API keys to function. Please note: │
│                                                     │
│  • Your API keys can be stored in your browser      │
│    based on your preference                         │
│  • All processing happens in your browser - your    │
│    conversations never leave your device            │
│  • We don't have access to your API keys or data    │
│  • You can choose how your keys are stored:         │
│    - Local Storage (persists between sessions)      │
│    - Session Storage (cleared when browser closes)  │
│    - No Storage (must re-enter each time)          │
│                                                     │
│  [✓] I understand and agree to these terms          │
│                                                     │
│  [     Cancel     ]    [     Continue     ]         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 1.3 API Key Setup Screen

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                  Setup Your API Keys                │
│                                                     │
│  (At least one key is required from any provider below)│
│                                                     │
│  OpenAI API Key:                                    │
│  [                                            ]     │
│  [?] How to get an OpenAI API key                   │
│                                                     │
│  Anthropic API Key:                                 │
│  [                                            ]     │
│  [?] How to get an Anthropic API key                │
│                                                     │
│  Google AI (Gemini) API Key:                        │
│  [                                            ]     │
│  [?] How to get a Google AI API key                 │
│                                                     │
│  Storage preference:                                │
│  (○) Session Storage (cleared when browser closes)  │
│  ( ) Local Storage (persists between sessions)      │
│  ( ) No Storage (must re-enter each time)           │
│                                                     │
│  [          Continue          ]                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 2. API Key Management

### 2.1 API Key Management Screen

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ← Settings                                         │
│                                                     │
│  API Keys                                           │
│                                                     │
│  OpenAI API Key:                                    │
│  [ ••••••••••••••••••••sk-xxxxxxx          ]       │
│  [Test Key] [Clear]                                 │
│                                                     │
│  Anthropic API Key:                                 │
│  [ ••••••••••••••••••••••••••••••          ]       │
│  [Test Key] [Clear]                                 │
│                                                     │
│  Google AI (Gemini) API Key:                        │
│  [                                            ]     │
│  [Test Key] [Clear]                                 │
│                                                     │
│  Storage preference:                                │
│  (○) Session Storage (cleared when browser closes)  │
│  ( ) Local Storage (persists between sessions)      │
│  ( ) No Storage (must re-enter each time)           │
│                                                     │
│  [          Save Changes          ]                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2.2 API Key Test Modal

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│               Testing OpenAI API Key                │
│                                                     │
│  ✓ API key validated successfully!                  │
│                                                     │
│  Available models:                                  │
│  • gpt-4o                                           │
│  • gpt-4-turbo                                      │
│  • gpt-3.5-turbo                                    │
│                                                     │
│  [             Close             ]                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 3. Theme Customization

### 3.1 Main Layout with Theme Selector

```
┌─────────────────────────────────────────────────────┐
│ Quorum    [Round Table] [Templates] [Settings]  👤  │
├─────────────────────────────────────────────────────┤
│ ┌─────┐                                      🌙│    │
│ │     │ Round Table Conversation            📋│    │
│ │  🎭 │                                     ⚙️│    │
│ │     │                                    ───┘    │
│ └─────┘                                             │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│ You: Hello, let's discuss AI ethics today.          │
│                                                     │
│ [                                          ] [Send] │
└─────────────────────────────────────────────────────┘
```

### 3.2 Theme Selector Dropdown

```
┌─────────────────────────────────────────────────────┐
│ Quorum    [Round Table] [Templates] [Settings]  👤  │
├─────────────────────────────────────────────────────┤
│ ┌─────┐                                      🌙│    │
│ │     │ Round Table Conversation         ┌───────┐  │
│ │  🎭 │                                  │ Light │  │
│ │     │                                  │ Dark  │  │
│ └─────┘                                  │ System│  │
│                                          │       │  │
│                                          │ Color │  │
│                                          │ Blue  │  │
│                                          │ Green │  │
│                                          │ Purple│  │
│                                          │ Orange│  │
│                                          └───────┘  │
│ You: Hello, let's discuss AI ethics today.          │
│                                                     │
│ [                                          ] [Send] │
└─────────────────────────────────────────────────────┘
```

## 4. Participant Configuration

### 4.1 Participant Form

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ← Participants                                     │
│                                                     │
│  Create New Participant                             │
│                                                     │
│  Name:                                              │
│  [                                            ]     │
│                                                     │
│  Provider:                                          │
│  [OpenAI ▼]                                         │
│                                                     │
│  Model:                                             │
│  [GPT-4o ▼]                                         │
│                                                     │
│  Role Description:                                  │
│  [                                            ]     │
│                                                     │
│  System Prompt:                                     │
│  +────────────────────────────────────────────+     │
│  | You are an expert in AI ethics. Your role  |     │
│  | is to provide thoughtful insights on the   |     │
│  | ethical implications of AI technologies.   |     │
│  |                                            |     │
│  +────────────────────────────────────────────+     │
│                                                     │
│  [Advanced Settings ▼]                              │
│  Temperature: [ 0.7 ]                               │
│  Max Tokens:  [ 1000 ]                              │
│                                                     │
│  [   Cancel   ]    [   Create Participant   ]       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4.2 Participant List

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ← Settings                                         │
│                                                     │
│  Participants                                       │
│                                                     │
│ ┌─────────────────────────────────────────────┐ │
│ │ Facilitator: [OpenAI GPT-4o ▼]                    │ │
│ │   (Leads the round table conversation)          │ │
│ └─────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────┐     │
│ │ AI Ethics Expert                            │     │
│ │ OpenAI GPT-4o                               │     │
│ │ [Edit] [Advanced] [Delete]                  │     │
│ └─────────────────────────────────────────────┘     │
│                                                     │
│ ┌─────────────────────────────────────────────┐     │
│ │ Technical Expert                            │     │
│ │ Anthropic Claude 3 Opus                     │     │
│ │ [Edit] [Advanced] [Delete]                  │     │
│ └─────────────────────────────────────────────┘     │
│                                                     │
│ ┌─────────────────────────────────────────────┐     │
│ │ Creative Thinker                            │     │
│ │ OpenAI GPT-4o                               │     │
│ │ [Edit] [Advanced] [Delete]                  │     │
│ └─────────────────────────────────────────────┘     │
│                                                     │
│ [+ Add Participant]                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4.3 Advanced Settings for Participant

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│ Advanced Settings for: OpenAI GPT-4o Technical Expert  │
│                                                     │
│  Temperature:                                       │
│  Cold 0 [●─────────] 1 Creative                     │
│                                                     │
│  Max Tokens per Response:                           │
│  [      2000       ]                                │
│                                                     │
│  Top P:                                             │
│  [       0.9       ]                                │
│                                                     │
│  Frequency Penalty:                                 │
│  [       0.0       ]                                │
│                                                     │
│  Presence Penalty:                                  │
│  [       0.0       ]                                │
│                                                     │
│  Function Calling:                                  │
│  [     Disabled    ▼]                               │
│                                                     │
│  Response Format:                                   │
│  [      Text       ▼]                               │
│                                                     │
│  [   Cancel   ]    [   Save Changes   ]             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 5. Round Table Conversation

### 5.1 Main Chat Screen with Round Table

```
┌─────────────────────────────────────────────────────┐
│ Quorum    [Round Table] [Templates] [Settings]  👤  │
├─────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐    │
│ │           ┌─────┐                            │    │
│ │     ┌─────┤ You │─────┐                      │    │
│ │     │     └─────┘     │                      │    │
│ │     │                 │                      │    │
│ │┌────┴─┐           ┌───┴───┐                  │    │
│ ││Ethics│           │ Tech  │                  │    │
│ ││Expert│           │Expert │                  │    │
│ │└──────┘           └───────┘                  │    │
│ │     │                 │                      │    │
│ │     │    ┌───────┐    │                      │    │
│ │     └────┤Facil- ├────┘                      │    │
│ │          │itator │                           │    │
│ │          └───────┘                           │    │
│ └──────────────────────────────────────────────┘    │
│                                                     │
│ System: Welcome to your round table discussion.     │
│ Facilitator: What topic would you like to explore?  │
│ You: Let's discuss the future of work with AI.      │
│ Ethics Expert: When we consider the future of...    │
│ Tech Expert: From a technical perspective, AI...    │
│ Facilitator: Those are excellent points. Let's...   │
│                                                     │
│ [                                          ] [Send] │
│ [Auto-Advance: ON] [Pause] [Skip] [Priority Mode]   │
└─────────────────────────────────────────────────────┘
```

### 5.2 Quick Participant Edit

```
┌─────────────────────────────────────────────────────┐
│ Quorum    [Round Table] [Templates] [Settings]  👤  │
├─────────────────────────────────────────────────────┤
│ ┌───────────────────────────┐                       │
│ │           ┌─────┐         │                       │
│ │     ┌─────┤ You │─────┐   │ ┌───────────────────┐ │
│ │     │     └─────┘     │   │ │ Tech Expert      │ │
│ │     │                 │   │ │                  │ │
│ │┌────┴─┐           ┌───┴───┐│ │ System Prompt:  │ │
│ ││Ethics│           │ Tech  ││ │ +─────────────+ │ │
│ ││Expert│           │Expert ││ │ | Edit prompt | │ │
│ │└──────┘           └───────┘│ │ +─────────────+ │ │
│ │     │                 │    │ │                  │ │
│ │     │    ┌───────┐    │    │ │ Temperature: 0.7 │ │
│ │     └────┤Facil- ├────┘    │ │ Max Tokens: 1000 │ │
│ │          │itator │         │ │                  │ │
│ │          └───────┘         │ │ [Detailed Edit]  │ │
│ └───────────────────────────┘ └───────────────────┘ │
│                                                     │
│ Tech Expert: From a technical perspective, AI will  │
│ significantly transform workflows through...        │
│                                                     │
│ [                                          ] [Send] │
│ [Auto-Advance: ON] [Pause] [Skip] [Priority Mode]   │
└─────────────────────────────────────────────────────┘
```

### 5.3 Conversation Summary

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                Conversation Summary                 │
│                                                     │
│  Topic: Future of Work with AI                      │
│                                                     │
│  Key Points:                                        │
│  • AI automation will transform job roles rather    │
│    than eliminate them entirely                     │
│  • New job categories will emerge around AI         │
│    oversight, training, and ethics                  │
│  • Concerns about inequality in AI benefits         │
│  • Technical challenges in human-AI collaboration   │
│  • Recommendations for policy and education         │
│                                                     │
│  Participant Contributions:                         │
│  ┌───────────────────────────────────────────┐      │
│  │ Ethics Expert ████████████████████        │      │
│  │ Tech Expert   ███████████████             │      │
│  │ You           ████████                    │      │
│  │ Facilitator   ███████                     │      │
│  └───────────────────────────────────────────┘      │
│                                                     │
│  [Export Summary] [Return to Conversation]          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 6. Templates Management

### 6.1 Templates List

```
┌─────────────────────────────────────────────────────┐
│ Quorum    [Round Table] [Templates] [Settings]  👤  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Your Templates                                     │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Ethical AI Discussion                        │    │
│  │ 3 participants: Ethics, Technical, Creative  │    │
│  │ [Use] [Edit] [Share] [Delete]                │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Product Development Team                     │    │
│  │ 4 participants: PM, Designer, Dev, QA        │    │
│  │ [Use] [Edit] [Share] [Delete]                │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Story Brainstorming                          │    │
│  │ 3 participants: Editor, Writer, Critic       │    │
│  │ [Use] [Edit] [Share] [Delete]                │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  [+ Create New Template]  [Import Template]         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 6.2 Template Form

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ← Templates                                        │
│                                                     │
│  Create New Template                                │
│                                                     │
│  Template Name:                                     │
│  [                                            ]     │
│                                                     │
│  Description:                                       │
│  [                                            ]     │
│                                                     │
│  Participants:                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ ✓ Facilitator (GPT-4o)                      │    │
│  │ ✓ Ethics Expert (Claude 3 Opus)             │    │
│  │ ✓ Technical Expert (GPT-4o)                 │    │
│  │ ✓ Creative Thinker (Claude 3 Sonnet)        │    │
│  │ ✓ You                                       │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  [Configure Participant Order ▼]                    │
│                                                     │
│  Default Conversation Starter:                      │
│  [                                            ]     │
│                                                     │
│  [   Cancel   ]    [   Save Template   ]            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 7. Settings Screens

### 7.1 Main Settings

```
┌─────────────────────────────────────────────────────┐
│ Quorum    [Round Table] [Templates] [Settings]  👤  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Settings                                           │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ API Keys                                  > │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Participants                               > │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Appearance                                 > │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ LLM Defaults                               > │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Language                                   > │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Privacy & Storage                          > │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Accessibility                              > │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  App Version: 1.0.0                                 │
│  [Check for Updates]                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 7.2 Privacy Settings

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ← Settings                                         │
│                                                     │
│  Privacy & Storage                                  │
│                                                     │
│  Data Storage:                                      │
│  [×] Store conversation history                     │
│  [×] Store templates                                │
│  [×] Store user preferences                         │
│  [ ] Allow analytics (anonymous usage data)         │
│                                                     │
│  API Key Storage:                                   │
│  (○) Session Storage (cleared when browser closes)  │
│  ( ) Local Storage (persists between sessions)      │
│  ( ) No Storage (must re-enter each time)           │
│                                                     │
│  Data Management:                                   │
│  [Export All Data]                                  │
│  [Clear All Stored Data]                            │
│                                                     │
│  Note: Clearing data cannot be undone. Export your  │
│  data first if you want to keep it.                 │
│                                                     │
│  [          Save Changes          ]                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 8. Error and System Messages

### 8.1 API Error Modal

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                  API Key Error                      │
│                                                     │
│  ⚠️ We couldn't connect to OpenAI's API.           │
│                                                     │
│  Error details:                                     │
│  Authentication error - invalid API key or token    │
│  has expired.                                       │
│                                                     │
│  Suggestions:                                       │
│  • Check your API key for typos                     │
│  • Verify your OpenAI account has available credits │
│  • Try regenerating a new API key                   │
│                                                     │
│  [Update API Key]      [Skip This Participant]      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 8.2 Network Status Indicator

```
┌─────────────────────────────────────────────────────┐
│ Quorum    [Round Table] [Templates] [Settings]  👤  │
├─────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐    │
│ │           Round Table View                   │    │
│ └──────────────────────────────────────────────┘    │
│                                                     │
│ ┌──────────────────────────────────────────────┐    │
│ │ ⚠️ Limited connectivity detected              │    │
│ │ Using low-bandwidth mode                      │    │
│ └──────────────────────────────────────────────┘    │
│                                                     │
│ You: How can we improve AI safety?                  │
│                                                     │
│ AI Ethics Expert: When discussing AI safety...      │
│                                                     │
│ Tech Expert: (Waiting for response...)              │
│ 🔄 AI requests may take longer than usual           │
│                                                     │
│ [                                          ] [Send] │
│ [Auto-Advance: ON] [Pause] [Skip] [Priority Mode]   │
└─────────────────────────────────────────────────────┘
```

## 9. Help and Documentation

### 9.1 Help Center

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                     Help Center                     │
│                                                     │
│  ┌─────────────────────┐ ┌─────────────────────────┐│
│  │                     │ │                         ││
│  │  Getting Started    │ │ How to Create Your      ││
│  │                     │ │ First Round Table       ││
│  └─────────────────────┘ │                         ││
│  ┌─────────────────────┐ │ 1. Log in to Quorum     ││
│  │                     │ │ 2. Click "Round Table"  ││
│  │  API Key Setup      │ │    in the top menu      ││
│  │                     │ │ 3. Add participants     ││
│  └─────────────────────┐ │    using the "+" button ││
│  │                     │ │ 4. Configure each       ││
│  │  Participant Config │ │    participant with a   ││
│  │                     │ │    role and personality ││
│  └─────────────────────┐ │ 5. Start your          ││
│  │                     │ │    conversation         ││
│  │  Templates          │ │                         ││
│  │                     │ │ [Watch Tutorial Video]  ││
│  └─────────────────────┘ └─────────────────────────┘│
│                                                     │
│  [Search Help Topics...]                            │
│                                                     │
│  Can't find what you need? [Contact Support]        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 9.2 Keyboard Shortcuts Overlay

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                 Keyboard Shortcuts                  │
│                                                     │
│  Conversation:                                      │
│  Ctrl/⌘ + Enter    Send message                     │
│  Ctrl/⌘ + →        Skip current participant         │
│  Ctrl/⌘ + Space    Pause/resume auto-advance        │
│  Ctrl/⌘ + P        Toggle priority mode             │
│                                                     │
│  Navigation:                                        │
│  Ctrl/⌘ + 1        Go to Round Table                │
│  Ctrl/⌘ + 2        Go to Templates                  │
│  Ctrl/⌘ + 3        Go to Settings                   │
│  Escape            Close modals                     │
│                                                     │
│  Participants:                                      │
│  Alt + N           Add new participant              │
│  Alt + E           Edit selected participant        │
│  Alt + D           Delete selected participant      │
│                                                     │
│  [Customize Shortcuts]   [Reset to Defaults]        │
│                                                     │
│  [             Close             ]                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 10. Mobile Responsive Layouts

### 10.1 Mobile Round Table View

```
┌───────────────────────┐
│ Quorum          ☰  │
├───────────────────────┤
│ Round Table    👤    │
│                      │
│ ┌──────────────────┐ │
│ │                  │ │
│ │       You        │ │
│ │        ↓         │ │
│ │   Facilitator    │ │
│ │        ↓         │ │
│ │   Ethics Expert  │ │
│ │        ↓         │ │
│ │    Tech Expert   │ │
│ │                  │ │
│ │ [Circular View ▼] │ │
│ └──────────────────┘ │
│                      │
│ You: I'm interested  │
│ in discussing...     │
│                      │
│ Facilitator: That's  │
│ a great topic! Let's │
│ start by...          │
│                      │
│ Ethics Expert:       │
│ From an ethical      │
│ standpoint...        │
│                      │
│ [                 ]  │
│ [Send] [⏸️] [⏩] [⚙️] │
└───────────────────────┘
```

### 10.2 Mobile Participant Creation

```
┌───────────────────────┐
│ ← Participants        │
├───────────────────────┤
│ New Participant       │
│                      │
│ Name:                │
│ [                 ]  │
│                      │
│ Provider:            │
│ [OpenAI ▼]           │
│                      │
│ Model:               │
│ [GPT-4o ▼]           │
│                      │
│ Role:                │
│ [                 ]  │
│                      │
│ System Prompt:       │
│ +─────────────────+  │
│ | You are an      |  │
│ | expert in...    |  │
│ +─────────────────+  │
│                      │
│ [Advanced Settings ▼] │
│ Temperature: [ 0.7 ]  │
│ Max tokens:  [1000 ]  │
│                      │
│ [Cancel] [Create]    │
└───────────────────────┘
```

These mockups provide a visual representation of the key screens needed to implement the user flows described in the `user-flows.md` document. The actual implementation should follow these designs while adhering to the design system and component library specified in the project requirements. 