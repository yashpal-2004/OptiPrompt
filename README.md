# OptiPrompt 🚀

OptiPrompt is a high-performance, production-ready toolkit designed to help developers and businesses reduce AI costs by up to 80% through intelligent prompt optimization and real-time token tracking.

![OptiPrompt Branding](https://picsum.photos/seed/optiprompt/1200/400)

## ✨ Key Features

- **Triple Optimization Modes**:
  - **CHEAP**: Aggressive AI-powered compression for maximum token savings.
  - **QUALITY**: Balanced refinement focusing on clarity, structure, and grammar.
  - **EXTREME**: Experimental refactoring for maximum logic density and efficiency.
- **Multi-Model Comparison**: Simultaneously optimize and compare results across different Gemini models:
  - **Gemini 3 Flash**
  - **Gemini 3.1 Pro**
  - **Gemini 3.1 Flash Lite**
- **High Availability**: Automatic rotation across 5 Gemini API keys to ensure 100% uptime and bypass rate limits.
- **Real-time Analytics**: Detailed dashboards tracking token usage, cost savings (in ₹ INR), and model distribution.
- **Cloud Sync**: Persistent history and settings powered by Firebase.
- **Premium UI**: Modern, responsive interface built with Tailwind CSS and smooth `motion` animations.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Motion.
- **Backend**: Node.js, Express (API Proxy and pre-optimization logic).
- **Database & Auth**: Firebase Firestore, Firebase Authentication.
- **AI SDKs**: `@google/genai`.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- 5x Google Gemini API Keys (for rotation)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in a `.env` file (see `.env.example`):
   ```env
   GEMINI_API_KEY_1=your_key_1
   GEMINI_API_KEY_2=your_key_2
   GEMINI_API_KEY_3=your_key_3
   GEMINI_API_KEY_4=your_key_4
   GEMINI_API_KEY_5=your_key_5
   ```

### Development

Run the development server (Full-stack mode):
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## 📁 Project Structure

- `src/components/`: UI components (Dashboard, Landing, Analytics, etc.)
- `src/lib/`: Context providers and utility functions.
- `server.ts`: Express backend for API proxying and pre-optimization logic.
- `firebase.ts`: Firebase initialization and configuration.
- `firestore.rules`: Secure database access patterns.

## 📄 License

This project is licensed under the Apache-2.0 License.

---
Built with ❤️ for the AI Developer Community.
