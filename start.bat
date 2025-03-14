@echo off
echo Starting PhotoScript App...

:: Start the FastAPI backend server in a new window
start cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python main.py"

:: Wait a moment for backend to start initializing
timeout /t 5

:: Start the frontend Vite dev server
start cmd /k "npm install && npm run dev"

echo Servers are starting... Please wait for both windows to initialize.