# AI Notes App

A modern note-taking application with AI-powered features built using Next.js 14, Redux, and OpenAI integration.

## Features

- Rich text editing with Tiptap editor and Markdown support
- AI-powered note summarization
- Voice recognition for hands-free note creation
- Dark/light mode support
- Real-time note saving with Redux Persist
- Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, shadcn/ui components
- **Editor**: Tiptap with React
- **State Management**: Redux Toolkit with Redux Persist
- **AI Integration**: OpenAI API for summarization and content generation
- **Styling**: Tailwind CSS with custom utilities

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-notes-app.git
cd ai-notes-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file in the root directory and add:
```
NEXT_PUBLIC_SUPABASE_URL= your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY= your_supabase_anon_key_here
NEXT_PUBLIC_OPENAI_API_KEY= your_openai_api_key_here
NEXT_PUBLIC_SITE_URL= your_site_url_here || localhost url
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Application Architecture

### Key Components

- **NoteEditor**: Rich text editor with AI summarization capabilities
- **NotesList**: List of all notes with search functionality
- **VoiceRecognition**: Speech-to-text for creating notes via voice
- **Redux Store**: Notes management with persistence

### AI Features

- **Text Summarization**: Generate concise summaries of long notes
- **Content Generation**: Create template-based notes with AI assistance
- **Voice Transcription**: Convert speech to written notes

## Implementation Details

The application follows a modern architecture with:

- App Router for page routing
- Redux for state management with local storage persistence
- OpenAI API integration for intelligent text processing
- Tiptap for rich text editing
- Responsive UI with Tailwind CSS and shadcn components
- Voice recognition API for speech input

## Deployment

The application is deployed to Vercel:
https://notes-app-ai-three.vercel.app

## Future Improvements

- Productivity templates generation using AI with checkboxes and potential tables
- Note sharing and collaboration features
- Categories and tags for better organization
- Enhanced UI and theme customization
- Tranformation into a PWA with offline support