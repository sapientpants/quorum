# Quorum - Multi-LLM Round Table Chat

Quorum is a modern web application that enables conversations with multiple LLMs (Large Language Models) and a single human participant in a single, unified chat interface. It creates a "round table" experience where different AI models and you interact together.

## 🌟 Features

### Multi-LLM Integration
- Support for multiple LLM providers (OpenAI, Anthropic, etc.)
- Configure each LLM with custom parameters (temperature, max tokens, etc.)

### Round Table Conversations
- Create conversations with multiple AI participants and you as the human participant
- Assign specific LLMs and role descriptions to each AI participant
- Define personas and expertise for each AI participant in the conversation
- Automatic round-robin turn-taking between you and the AI participants

### User-Friendly Interface
- Clean, modern UI built with React, TypeScript, and TailwindCSS
- Real-time streaming responses (when supported by the LLM)
- Light/dark mode theming
- Responsive design for all devices

### Security & Privacy
- Client-side only - no backend required
- Your API keys never leave your browser
- Optional local storage for conversation history

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- API keys for the LLMs you want to use

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/quorum.git
cd quorum
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🔑 API Keys

Quorum requires API keys to communicate with LLM providers:

- **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/account/api-keys)
- **Anthropic**: Get your API key from [Anthropic Console](https://console.anthropic.com/)
- **Other providers**: Follow their respective documentation

⚠️ **Important**: Your API keys are stored locally in your browser. Never share them with others.

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: TailwindCSS, DaisyUI
- **Build Tool**: Vite
- **Package Manager**: npm/yarn

## 📝 Development Roadmap

See the [implementation plan](docs/implementation-plan.md) for detailed information about the development roadmap.

## 📋 Feature List

For a comprehensive list of features, see the [features documentation](docs/features.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
