# Implementation Plan

## **Iteration 1: Basic Single-User Chat with One LLM**

### **Goals**
- Stand up a minimal React app that runs fully client-side.
- Allow the user to input an OpenAI API key.
- Enable a simple conversation with one LLM (e.g., GPT-3.5-turbo).
- Display conversation messages in a chat UI.

### **High-Level Features**
- Minimal UI with:
  - **API key input** (for OpenAI).
  - **Text input** for user messages.
  - **Chat area** displaying user and LLM messages.
- **Single LLM** integration (OpenAI only, single model).
- **Send message** → LLM responds → display.

### **Detailed Tasks**
1. **Initialize the Project**
   - Create a new React app (using Create React App, Vite, Next.js, etc.).
   - Set up basic folder structure (`components`, `hooks`, etc.).
2. **Build a Simple Layout**
   - Create a main `Chat` component (or `App` component).
   - Add a minimal top bar with the app’s title.
3. **API Key Input**
   - Create a small form (or text input) for the OpenAI API key.
   - Store the key in React state (`useState`) and optionally in `localStorage`.
4. **Message Input + Send Mechanism**
   - Text field for user messages.
   - “Send” button (or pressing Enter) triggers an API call to OpenAI.
5. **OpenAI Integration**
   - Implement a function `callOpenAI(messages, apiKey)` that:
     - Sends the conversation to `https://api.openai.com/v1/chat/completions`.
     - Returns the response text.
   - Handle basic error cases (invalid key, network errors).
6. **Display Messages**
   - Maintain a `messages` array in React state.
   - Each entry has `senderId`, `text`, `timestamp`.
   - Render this list in the chat area with simple styling.
7. **Test & Validate**
   - Manually verify that entering a valid OpenAI key, typing a user message, and receiving an LLM response works.

### **Exit Criteria**
- User can enter an OpenAI API key.
- User can send at least one prompt and receive one response from the LLM.
- Chat UI displays the user’s message and the LLM’s response.

---

## **Iteration 2: Multi-LLM Integration (Manual Switching)**

### **Goals**
- Support multiple LLM providers (e.g., OpenAI GPT and Anthropic Claude), but still single-user.
- User can switch which LLM to call.
- Still keep the conversation display basic.

### **High-Level Features**
- **Multi-LLM**: At least two providers (OpenAI, Anthropic).
- **Multiple API keys**: One for each provider.
- UI toggle or dropdown to select which LLM to query.

### **Detailed Tasks**
1. **Refactor API Key Management**
   - Create a dedicated component or section in the UI to manage multiple keys (e.g., `OpenAI Key`, `Anthropic Key`).
   - Store them in `useState` or optionally in `localStorage`.
2. **Add Support for Anthropic API Calls**
   - Implement a function `callAnthropic(messages, apiKey)` with Anthropic’s conversation API.
   - Handle typical errors or response parsing.
3. **Modify Chat Input Flow**
   - Add a UI element (dropdown, buttons, or tabs) to choose which LLM to send the prompt to.
   - Based on user selection, call the respective function (`callOpenAI` or `callAnthropic`).
4. **Messages Data Structure**
   - Retain the same shape (`senderId`, `text`) but now `senderId` can be `'openai'` or `'anthropic'` as well.
   - Keep track of which LLM responded last.
5. **Basic UI Enhancements**
   - Different color or label for messages from different LLMs (e.g., “GPT says…”, “Claude says…”).
6. **Testing & Validation**
   - Verify that the user can switch providers mid-conversation.
   - Check error handling for each LLM separately.

### **Exit Criteria**
- Users can enter two API keys (OpenAI, Anthropic).
- Users can send queries to either LLM at will.
- Conversation still displayed in a single feed with correct labels.

---

## **Iteration 3: Multi-User and Basic “Round Table” Logic**

### **Goals**
- Introduce the concept of multiple human participants (e.g., “Alice” and “Bob”).
- Provide a “round table” chat interface that can handle multiple named users, plus multiple LLMs.
- **Manual** approach for “round table”: user chooses which participant is speaking next.

> (If you want real-time multi-user over the network, you’d need a backend or WebSocket-based approach. This iteration assumes multiple participants on the same client or a single user controlling multiple “human” placeholders.)

### **High-Level Features**
- **Participant Management**: A small UI for listing participants (Alice, Bob, GPT, Claude, etc.).
- **Multiple Human Message Inputs**: Let the user pick which “human” is talking when they type.
- **Display distinct participant messages** in the same conversation feed.

### **Detailed Tasks**
1. **Extend Data Model for Participants**
   - `participants` array: 
     ```js
     [
       { id: 'alice', name: 'Alice', type: 'human' },
       { id: 'bob', name: 'Bob', type: 'human' },
       { id: 'gpt', name: 'GPT', type: 'llm' },
       { id: 'claude', name: 'Claude', type: 'llm' }
     ]
     ```
   - Store in state or a configuration object.
2. **UI for Participant Selection**
   - Small panel to show all participants.
   - For “human” participants, a dropdown or radio button so the user can say “I’m now speaking as Alice” or “I’m now speaking as Bob.”
3. **Message Input & Send**  
   - When the user types a message, they must choose which human participant is speaking.
   - The message is added to `messages` as `{ senderId: 'alice', text: 'Hello', timestamp: ... }`.
4. **LLM Responses in Round Table**
   - Continue using a button to ask GPT or Claude to respond to the conversation so far.
   - Keep the conversation logic the same (the user triggers each LLM response).
5. **UI Enhancements**
   - In the message list, clearly show the participant name or ID for each message.
   - Possibly use distinct icons or colors for each participant.
6. **Testing**
   - Simulate a conversation with “Alice” and “Bob,” taking turns. Then request GPT’s response, then Claude’s. Verify the conversation feed is consistent.

### **Exit Criteria**
- Multiple human “identities” can speak in the chat feed.
- Multiple LLMs can respond in the same feed.
- The user can see who said what at each turn.

---

## **Iteration 4: Automatic Round Robin & Basic Orchestration**

### **Goals**
- Implement optional “round robin” where participants automatically take turns (Alice → GPT → Bob → Claude → etc.).
- Introduce some basic conversation flow logic (avoid confusion about who’s next).

### **High-Level Features**
- **Round Robin Mode**: App determines who the “next speaker” is automatically.
- **Manual Override**: The user can still manually request a response from any participant.

### **Detailed Tasks**
1. **Conversation Flow State**
   - Add a piece of state called `currentSpeakerIndex` or similar.
   - After a participant posts a message, the next participant in the list is queued up to speak.
2. **Auto-trigger LLM Calls**
   - When the next speaker is an LLM, automatically call the corresponding API as soon as the conversation has updated.  
   - E.g., after GPT responds, set the next speaker to Bob or Claude. If it’s Claude, automatically call Anthropic next.
3. **Handle Edge Cases**
   - If the next speaker is a human, do nothing until the user provides input (or you can simulate “Bob’s input” if it’s a single user controlling all).
   - Provide a toggle in the UI: “Enable Round Robin Mode” vs. “Manual Mode.”
4. **UI Feedback**
   - Show a label: “Next speaker: GPT” or “Waiting for Bob to speak.”  
   - Possibly highlight the next speaker in the participant list.
5. **Testing**
   - Simulate a scenario: round table with 2 humans + 2 LLMs. Check that the conversation cycles in the correct order.
   - Ensure it doesn’t get stuck or loop infinitely.

### **Exit Criteria**
- Round-robin conversation works in typical scenarios.
- User can optionally disable round robin and just manually request LLM responses.

---

## **Iteration 5: Advanced Features & Enhancements**

### **Goals**
- Add features like streaming responses, advanced LLM settings (temperature, etc.), conversation summarization, and improved UI/UX.

### **High-Level Features**
- **Streaming Responses** (if supported by the LLM): Show partial output in real time.
- **LLM Settings**: Temperature, max tokens, top_p, etc.
- **Conversation Summarization** (optional).
- **Basic Theming** (light/dark mode).
- **Error Handling** improvements.

### **Detailed Tasks**
1. **Implement Streaming (e.g., OpenAI)**
   - Switch from a basic `fetch` to a streaming approach (e.g., using `ReadableStream` in the browser).
   - Update the UI to display partial responses as they arrive.
   - Show a “GPT is typing…” indicator until the stream closes.
2. **LLM Advanced Settings UI**
   - Add a small gear icon or “Advanced Settings” button next to each LLM participant.
   - Let the user set `temperature`, `max_tokens`, etc.
   - Pass these parameters in the request body (for OpenAI) or the equivalent for Anthropic.
3. **Summarization** (Optional)
   - If conversation length grows large, add a “Summarize so far” button.
   - Internally call the chosen LLM with instructions to summarize the conversation.
   - Replace or append the summary in the message list, possibly removing older messages.
4. **Theming**
   - Light mode / dark mode toggle.
   - Consistent styling for message bubbles, icons, and participant list.
5. **Error Handling** & **User Feedback**
   - Improve error messages if the API call fails.
   - Catch rate limits or invalid key errors and display a user-friendly message.
6. **Testing**
   - Check partial response streaming works smoothly.
   - Validate advanced settings by adjusting temperature and seeing changed output style.
   - Summarization logic tested on a longer conversation.

### **Exit Criteria**
- Streaming works for at least one LLM provider (e.g., OpenAI).
- Advanced LLM settings are adjustable and persist through conversation.
- The UI is more polished, with basic theming options.
- Error states are gracefully handled.

---

## **Iteration 6: Multi-User Real-Time Collaboration (Optional)**

*(Only if you want truly separate users connecting from different machines.)*

### **Goals**
- Introduce real-time sync so multiple remote users see the same conversation in real time.
- Possibly integrate with a service like Firebase, Supabase, or a custom Node/WebSocket backend.

### **High-Level Features**
- **User Authentication** (lightweight or via a third party).
- **Shared Conversation State** so that any user’s new message is broadcast to others.
- **Real-Time LLM Calls**: LLM responses appear for all participants.

### **Detailed Tasks** (High-Level Only)
1. **Backend/WebSocket Setup**
   - Decide on a real-time data store (Firebase, Supabase, or custom WebSocket server).
   - Implement basic routes or real-time channels for “chat rooms.”
2. **User Login / Identification**
   - Minimal sign-in flow or generate random user IDs if you want a quick solution.
3. **Sync Chat Messages**
   - On user message: push it to the server or real-time channel.
   - All clients listen for new messages and update their local `messages` state accordingly.
4. **Sync LLM Responses**
   - When an LLM is triggered, optionally handle the call on the client or a serverless function.  
   - The new message is broadcast to all users.
5. **UI Changes**
   - Show a “Users Online” indicator or participant list for actual remote users.
   - Possibly show a “typing” indicator if you want advanced real-time features.

### **Exit Criteria**
- Multiple browsers can open the chat application, each with distinct user identities.
- Messages posted by one user show up in real time for all connected users.
- LLM responses also appear in real time.

---

## **Iteration 7: Polishing, Optimization, and Final Checks**

### **Goals**
- Improve performance, handle large conversations gracefully.
- Polish UI/UX and finalize the design.
- Perform final security checks and disclaimers.

### **High-Level Features**
- **Local Caching** or **Pagination** for large chats.
- **Performance Tuning** for re-renders.
- **UI Polish** (responsive design, cross-browser testing).
- **Security Review** (especially around storing keys).

### **Detailed Tasks**
1. **Performance Profiling**
   - Use React DevTools Profiler to identify any heavy re-renders.
   - Memoize components if needed.
2. **Conversation Pagination / Lazy Loading**
   - If conversation is very long, implement “Load More” or infinite scroll for older messages.
3. **Cross-Browser Testing**
   - Test on Chrome, Firefox, Safari, mobile browsers to ensure consistent UI.
4. **Final UI/UX Tweaks**
   - Improve layout, spacing, alignment, brand styling.
   - Possibly add animations for message appearance.
5. **Security & Privacy** 
   - Double-check disclaimers about storing API keys locally.
   - Provide a “Clear All Data” button to remove keys and conversation logs from localStorage.
6. **Documentation / Help**
   - Write or refine instructions on how to set up keys, how to run the app, and how to interpret advanced settings.

### **Exit Criteria**
- App is stable, performs well with moderate conversation size.
- All disclaimers and instructions are in place.
- All known bugs are resolved or tracked.
