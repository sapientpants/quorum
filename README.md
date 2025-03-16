# Quorum - Multi-LLM Chat

Quorum is a web application that allows you to chat with multiple Large Language Models (LLMs) in a round-table format. Compare responses, create expert panels, and facilitate model-to-model conversations. This project is built with React, TypeScript, Vite, Tailwind CSS, and HeroUI.

![Quorum Screenshot](public/screenshot.png)

## Features

- **Modern UI**: Sleek interface with multiple theme options via HeroUI
- **Multi-LLM Support**: Chat with multiple AI models simultaneously (OpenAI, Anthropic, Grok, Google)
- **Round Table**: Visual circular interface for organizing AI participants
- **Expert Panels**: Create specialized panels of AI models for different tasks
- **Model Comparison**: Compare responses from different models side-by-side
- **API Key Management**: Securely store your API keys locally in your browser
- **Responsive Design**: Works on desktop and mobile devices
- **Streaming Responses**: Real-time display of AI responses as they're generated

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, HeroUI components
- **Icons**: Solar icons via Iconify
- **State Management**: Zustand
- **Drag and Drop**: @dnd-kit/core
- **Routing**: React Router
- **Testing**: Vitest, React Testing Library

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- API keys for LLM providers (OpenAI, Anthropic, Grok, Google)

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

## Usage

1. Enter at least one API key in the Settings > API Keys section
2. Configure AI participants with different roles and system prompts
3. Arrange participants in the round table
4. Start a conversation and watch as each AI participant takes their turn

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI, Anthropic, Grok, and Google for their amazing LLM APIs
- The React and Vite communities for their excellent tools
- HeroUI for the beautiful component library
