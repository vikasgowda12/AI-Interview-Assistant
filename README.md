# 🎙️ AI Interview Assistant

An AI-powered mock interview platform that helps users practice technical and HR interviews through dynamically generated questions, answer evaluation, scoring, and personalized feedback.

## 🌐 Live Demo

Try the deployed application:

https://ai-interview-assistant-frontend-bsrq.onrender.com

> Note: The backend is hosted on Render's free tier and may take a short time to wake up after inactivity.

## 🚀 Features

- AI-generated interview questions
- Role-based mock interviews
- Multiple difficulty levels
- Technical and HR interview categories
- Customizable number of questions
- AI-powered answer evaluation
- Score generation for interview responses
- Identification of strengths and areas for improvement
- Detailed feedback for every answer
- AI-generated improved answers
- Text-to-speech functionality for interview questions
- Interactive and responsive user interface
- Deployed frontend and backend

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- HTML
- CSS

### Backend

- Python
- FastAPI
- Uvicorn

### AI Integration

- OpenRouter API
- Large Language Models (LLMs)

### Deployment

- Render
- GitHub

## ⚙️ How It Works

1. The user selects a target job role.
2. The user chooses the interview difficulty and category.
3. The user selects the number of interview questions.
4. The AI generates a relevant interview question.
5. The user submits an answer.
6. The AI evaluates the response.
7. The application provides:
   - Score
   - Strengths
   - Areas for improvement
   - Detailed feedback
   - A better sample answer
8. The user continues through the remaining interview questions.

## 📁 Project Structure

```text
AI-Interview-Assistant/
│
├── backend/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── pages/
│   │   │   └── Interview.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
git clone https://github.com/vikasgowda12/AI-Interview-Assistant.git
cd AI-Interview-Assistant
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
cd frontend
npm install
npm run dev
Author

Vikas Gowda

GitHub: https://github.com/vikasgowda12

📄 License This project is intended for educational and portfolio purposes.
