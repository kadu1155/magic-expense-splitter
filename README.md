# Disney Magic Expense Splitter AI 🏰✨

A full-stack, AI-powered expense management application with a whimsical Disney theme. Built for speed, harmony, and magical group experiences.

## ✨ Features
- **AI Quick Add**: Type natural sentences (e.g., "I paid ₹1500 for lunch with Mickey") and let the AI handle the rest.
- **Smart Settlement Engine**: Minimizes group debts with optimized transaction logic.
- **Magical Dashboard**: A premium, responsive UI with Starry Night animations and floating silhouettes.
- **Pixie Dust Insights**: Get AI-generated group harmony scores and spending summaries.
- **No Login Required**: Instant access to the dashboard for friction-less usage.

## 🛠 Tech Stack
- **Frontend**: React 19, Vite, React Router v7
- **Backend**: Node.js, Express
- **Database**: SQLite (managed via Sequelize ORM)
- **AI**: Google Gemini 1.5 Flash
- **Styling**: Vanilla CSS (Modern Glassmorphism)

## 🚀 Local Setup

1. **Clone the repository.**
2. **Install Dependencies**: Run `npm run install-all` from the root to install both frontend and backend dependencies.
3. **Environment Setup**: Create a `.env` file in the `server` folder and add your `GEMINI_API_KEY`. See `server/.env.example` for reference.

> [!IMPORTANT]
> **This project requires TWO separate terminal windows to run locally:**

4. **Terminal 1 (Backend)**:
   ```bash
   cd server
   npm start
   ```
5. **Terminal 2 (Frontend)**:
   ```bash
   npm run dev
   ```

Now open the URL shown in Terminal 2 (usually `http://localhost:5173`) to see the magic! ✨

## 🧞‍♂️ Deployment
This project is configured for easy deployment on **Render**. For detailed steps, see the `deployment_guide.md` in the project root.

---
Built with trust, faith, and a little pixie dust by **Kadambari**.
