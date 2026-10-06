
import React from "react";
import { useNavigate } from "react-router-dom";
import SupervisorSidebar from "../components/SupervisorSidebar";

const SupervisorAIChatbot = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SupervisorSidebar onLogout={handleLogout} />

      <main className="min-h-screen p-6 lg:ml-64">
        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-10 text-center shadow-xl">
            <div className="text-5xl">🤖</div>

            <h1 className="mt-5 text-3xl font-black text-slate-800">
              AI Chatbot
            </h1>

            <p className="mt-2 text-lg font-bold text-indigo-600">
              Coming Soon 🚀
            </p>

            <p className="mt-2 text-sm text-slate-500">
              CampusFix AI Assistant is under development.
            </p>

            <button
              type="button"
              onClick={() => navigate("/supervisor/dashboard")}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupervisorAIChatbot;
