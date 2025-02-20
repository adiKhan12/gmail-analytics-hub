# Email Planner

Email Planner is a modern email management system that helps you organize, analyze, and prioritize your emails using AI. Built with FastAPI and React, it provides intelligent email categorization, priority scoring, and actionable insights.

## Features

- 🔒 Secure Google OAuth2 Authentication
- 📊 Interactive Dashboard with Email Analytics
- 🤖 AI-Powered Email Analysis
  - Automatic Categorization
  - Priority Scoring
  - Sentiment Analysis
  - Action Item Extraction
  - Email Summarization
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
4. Monitor real-time progress of email synchronization and analysis

## API Documentation

Once the backend is running, you can access:
- Interactive API docs: `http://localhost:8000/docs`
- OpenAPI specification: `http://localhost:8000/openapi.json`

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