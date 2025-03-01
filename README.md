# Email Planner

Email Planner is a modern email management system that helps you organize, analyze, and prioritize your emails using AI. Built with FastAPI and React, it provides intelligent email categorization, priority scoring, and actionable insights.

## Features

- 🔒 Secure Google OAuth2 Authentication
- 📊 Interactive Dashboard with Email Analytics
  - Email volume trends
  - Category distribution visualization
  - Priority and sentiment breakdowns
  - High-priority email highlights
- 🔍 Advanced Email Search & Filtering
  - Search by keywords, sender, or content
  - Filter by category, priority level, and action items
  - Save and manage search filters
  - Real-time results updating
- 🤖 AI-Powered Email Analysis
  - Automatic Categorization
  - Priority Scoring (1-5 scale)
  - Sentiment Analysis (Positive/Neutral/Negative)
  - Action Item Extraction
  - Email Summarization
- ✍️ Intelligent Draft Generation
  - AI-powered email replies and forwards
  - Context-aware response generation
  - Customizable with user instructions
  - Fallback generation when offline
  - Edit before sending
- 📈 Real-time Progress Tracking
- 📱 Responsive Material-UI Design

## Tech Stack

### Backend
- FastAPI - Modern Python web framework
- SQLAlchemy - SQL toolkit and ORM
- DeepSeek API - AI/LLM for email analysis
- Google Gmail API - Email synchronization
- SQLite/PostgreSQL - Database

### Frontend
- React - UI library
- TypeScript - Type safety
- Material-UI - Component library
- Recharts - Interactive charts
- Axios - HTTP client

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- Google Cloud Platform account
- DeepSeek API account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/email-planner.git
   cd email-planner
   ```

2. Set up the backend:
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Copy example env file and update with your values
   cp .env.example .env
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

### Configuration

1. Create a Google Cloud Project and configure OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable Gmail API
   - Configure OAuth consent screen
   - Create OAuth credentials (Web application)
   - Add authorized redirect URI: `http://localhost:8000/api/v1/auth/callback/google`

2. Get a DeepSeek API key:
   - Sign up at [DeepSeek](https://deepseek.com)
   - Generate an API key

3. Update the `.env` file with your credentials:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   DEEPSEEK_API_KEY=your-api-key
   SECRET_KEY=your-secret-key
   ```

### Running the Application

1. Start the backend server:
   ```bash
   # From the root directory
   uvicorn app.main:app --reload
   ```

2. Start the frontend development server:
   ```bash
   # From the frontend directory
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Sign in with your Google account
2. Click "Sync Emails" to start importing and analyzing your emails
3. View email statistics and insights in the dashboard
4. Navigate to the Emails page to search and filter your emails:
   - Use the search bar for keyword searches
   - Apply filters for category, priority, sender, and action items
   - Click on an email to view its details
5. When viewing an email, you can:
   - Mark as read/unread
   - Toggle importance
   - View AI-generated summary and extracted action items
   - See sentiment analysis and priority score
6. Use the AI-powered draft generation:
   - Click "Reply" or "Forward" when viewing an email
   - Optionally provide specific instructions (e.g., "Politely decline" or "Ask for more details")
   - Review and edit the generated draft
   - Click "Regenerate" to create a new version
   - Send or save the draft when ready

## API Documentation

Once the backend is running, you can access:
- Interactive API docs: `http://localhost:8000/docs`
- OpenAPI specification: `http://localhost:8000/openapi.json`

## AI Capabilities

Email Planner leverages the DeepSeek API to provide advanced AI features:

1. **Email Analysis**
   - Automatically categorizes emails (Work, Personal, Newsletter, etc.)
   - Assigns priority scores based on urgency and importance
   - Detects sentiment to identify positive, neutral, or negative messages
   - Extracts action items that require your attention
   - Generates concise summaries of lengthy emails

2. **Draft Generation**
   - Creates contextually appropriate email replies and forwards
   - Analyzes the original email's content, tone, and purpose
   - Addresses specific questions or requests from the original email
   - Incorporates user instructions for customized responses
   - Maintains professional tone and formatting

3. **Fallback Capabilities**
   - Client-side draft generation when offline or API unavailable
   - Graceful degradation of AI features
   - Preserves core functionality in all conditions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security

- Never commit your `.env` file
- Keep your API keys and secrets secure
- Regularly update dependencies
- Follow security best practices for OAuth implementations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [Google Gmail API](https://developers.google.com/gmail/api)
- [DeepSeek](https://deepseek.com) 