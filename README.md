# addXmakeY 🎨

A modern web application for AI-powered image generation and editing using Google's Gemini 2.0 Flash API.

## Features ✨

- 🖼️ Image Generation: Create unique images from text descriptions
- ✏️ Image Editing: Modify existing images using natural language prompts
- 🌓 Dark/Light Theme: Built-in theme support with smooth transitions
- 📱 Responsive Design: Works seamlessly on desktop and mobile devices
- 🔄 Conversation History: Keep track of your image generation/editing journey
- ⬇️ Easy Downloads: Download generated images with one click

## Tech Stack 🛠️

- **Framework**: [Next.js 15](https://nextjs.org/) with TypeScript
- **AI**: [Google Generative AI](https://ai.google.dev/) (Gemini 2.0 Flash)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom theme configuration
- **UI Components**: Custom components built with [Radix UI](https://www.radix-ui.com/)
- **File Handling**: [React Dropzone](https://react-dropzone.js.org/) for image uploads
- **Theme Management**: [next-themes](https://github.com/pacocoursey/next-themes)

## Getting Started 🚀

### Prerequisites

- Node.js 18.x or later
- A Google AI API key (Gemini 2.0)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd addxmakey
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Google AI API key:
```env
GEMINI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production 🏗️

```bash
npm run build
npm start
```

## Environment Variables 🔐

- `GEMINI_API_KEY`: Your Google Generative AI API key

## Project Structure 📁

```
addxmakey/
├── app/                   # Next.js app router components
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components
│   └── ...              # Feature-specific components
├── lib/                 # Utility functions and types
└── public/              # Static assets
```

## Features in Detail 🔍

### Image Generation
- Input text descriptions to generate AI images
- Real-time progress tracking
- High-quality image output

### Image Editing
- Upload existing images
- Describe desired changes in natural language
- Preview and download edited results

### User Interface
- Clean, modern design
- Responsive layout
- Accessible components
- Dark/light theme support

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is private and proprietary.

---

Built with ❤️ using Next.js and Google's Gemini 2.0