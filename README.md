# Quorum - Multi-LLM Chat

Quorum is a web application that allows you to chat with multiple Large Language Models (LLMs) in a round-table format. Compare responses, create expert panels, and facilitate model-to-model conversations. This project is built with React, TypeScript, Vite, Tailwind CSS, and HeroUI.

![Quorum Screenshot](public/screenshot.png)

## Features

- **Modern UI**: Sleek dark-themed interface with gradient accents and glassmorphism effects
- **Multi-LLM Support**: Chat with multiple AI models simultaneously
- **Expert Panels**: Create specialized panels of AI models for different tasks
- **Model Comparison**: Compare responses from different models side-by-side
- **API Key Management**: Securely store your API keys locally in your browser
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, HeroUI components
- **Icons**: Solar icons via Iconify
- **Routing**: React Router
- **State Management**: React Hooks
- **Testing**: Vitest, React Testing Library

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- API keys for LLM providers (OpenAI, Anthropic, etc.)

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

1. Click "Get Started" on the landing page
2. Enter your API keys in the Settings page
3. Create a new chat or use a template
4. Add AI participants to your conversation
5. Start chatting with multiple models

## Project Structure

```
quorum/
├── docs/             # Project documentation
├── public/           # Static assets
├── src/              # Source code
│   ├── components/   # React components
│   │   ├── layouts/  # Layout components
│   │   └── ui/       # UI components (Button, Card, etc.)
│   │   └── App.tsx       # Main application component
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Page components
│   ├── routes/       # Routing configuration
│   ├── services/     # API services
│   ├── types/        # TypeScript type definitions
│   └── main.tsx      # Application entry point
├── .github/          # GitHub workflows
├── .husky/           # Git hooks
└── ...               # Configuration files
```

## Development

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
- [HeroUI](https://www.heroui.com/)
- [Solar Icons](https://icon-sets.iconify.design/solar/)
- [OpenAI](https://openai.com/)
- [Anthropic](https://www.anthropic.com/)
