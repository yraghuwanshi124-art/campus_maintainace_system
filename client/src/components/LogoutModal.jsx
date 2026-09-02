
import { useNavigate } from "react-router-dom";

function LogoutModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">

      {/* Modal */}
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Top Illustration */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-5xl shadow-inner backdrop-blur-sm">
            👋
          </div>
        </div>

        {/* Content */}
        <div className="px-7 py-7 text-center">

          <h2 className="text-2xl font-extrabold text-slate-800">
            Ready to leave?
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Are you sure you want to logout from
            <span className="font-bold text-indigo-600"> CampusFix</span>?
          </p>

          {/* Buttons */}
          <div className="mt-7 flex gap-3">

            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-bold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md"
            >
              Logout
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default LogoutModal;
