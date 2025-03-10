# Quorum - Multi-LLM Chat

Quorum is a web application that allows you to chat with multiple Large Language Models (LLMs) in a single conversation. This project is built with React, TypeScript, Vite, Tailwind CSS, and Daisy UI.

## Current Features (Iteration 1)

- Simple chat interface with message history
- OpenAI API integration (GPT-4o)
- API key management (stored locally in your browser)
- Error handling for API calls

## Upcoming Features

- Support for multiple LLM providers (Anthropic, Cohere, etc.)
- AI participants with specific roles and personalities
- Round-robin conversation flow
- Streaming responses
- Conversation management (save, load, summarize)
- And more!

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/quorum.git
   cd quorum
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Usage

1. Enter your OpenAI API key in the input field at the top of the page
2. Type your message in the input field at the bottom of the page
3. Press Enter or click the Send button to send your message
4. The AI will respond to your message

## Development

### Project Structure

```
quorum/
├── docs/             # Project documentation
├── public/           # Static assets
├── src/              # Source code
│   ├── assets/       # Images, fonts, etc.
│   ├── components/   # React components
│   ├── services/     # API services
│   ├── types/        # TypeScript type definitions
│   ├── App.tsx       # Main application component
│   └── main.tsx      # Application entry point
├── .github/          # GitHub workflows
├── .husky/           # Git hooks
└── ...               # Configuration files
```

### Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check for code issues
- `npm run preview` - Preview the production build locally
- `npm run test` - Run tests

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Daisy UI](https://daisyui.com/)
- [OpenAI](https://openai.com/)
