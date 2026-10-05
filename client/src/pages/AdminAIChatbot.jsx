import React from "react";

const AdminAIChatbot = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-xl rounded-3xl border border-indigo-100 bg-white p-10 text-center shadow-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-4xl">
          🤖
        </div>

        <h1 className="mt-6 text-3xl font-black text-slate-800">
          AI Chatbot
        </h1>

        <p className="mt-3 text-lg font-semibold text-indigo-600">
          Coming Soon 🚀
        </p>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          CampusFix AI Assistant is currently under development.
          It will soon help you manage complaints and get useful
          campus maintenance information.
        </p>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500">
          <span className="h-2 w-2 rounded-full bg-amber-400"></span>
          Under Development
        </div>
      </div>
    </div>
  );
};

export default AdminAIChatbot;