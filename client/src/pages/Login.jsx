
import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      setMessage("Login successful!");

      const role = response.data.user.role;

      if (role === "student") {
        navigate("/student");
      } else if (role === "admin") {
        navigate("/admin");
      } else if (role === "technician") {
        navigate("/technician");
      } else if (role === "supervisor") {
        navigate("/supervisor/dashboard");
      }
    } catch (error) {
      console.log(error);
      setMessage(
        
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE - COLLEGE */}
        <div className="relative hidden overflow-hidden lg:block">

          <img
            src="https://www.medicaps.ac.in/public/frontend/images/home_about-img.webp"
            alt="Medi-Caps University Campus"
            className="absolute inset-0 h-full w-full object-cover shadow-lg"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-slate-900/65"></div>

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">

            {/* Top */}
            <div>

              <div className="mb-7">
                <img
                  src="https://www.medicaps.ac.in/public/frontend/images/medicaps-logo-fin.webp"
                  alt="Medi-Caps University"
                  className="h-15 w-70"
                />
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
                Medi-Caps University
              </p>

              <h1 className="mt-4 max-w-xl text-5xl font-bold leading-tight">
                Campus Maintenance
                <span className="block text-indigo-300">
                  Management System
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-200">
                A centralized platform to report, track and
                manage maintenance issues across the campus.
              </p>

            </div>

            {/* Bottom */}
            <div>

              <div className="mb-6 h-px w-24 bg-indigo-300"></div>

              <p className="text-sm text-slate-300">
                Smart Campus • Faster Resolution • Better Management
              </p>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE - LOGIN */}
        <div className="flex items-center justify-center px-7 py-10">

          <div className="w-full max-w-md">

            {/* Mobile Branding */}
            <div className="mb-10 text-center lg:hidden">

              <h1 className="mt-4 text-4xl font-bold text-slate-800">
                Medi-Caps University
              </h1>

              <p className="mt-2 text-1xl text-slate-500">
                Campus Maintenance Management System
              </p>

            </div>

            {/* Login Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">

              {/* Header */}
              <div className="mb-8">

                <p className="text-2xl font-semibold text-indigo-600">
                  Welcome Back
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  Sign in
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to access your maintenance dashboard.
                </p>

              </div>

              {/* Form */}
              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* Email */}
                <div>

                  <label className="mb-2 block text-2xl font-semibold text-slate-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-1xl text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />

                </div>

                {/* Password */}
                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label className="block text-2xl font-semibold text-slate-700">
                      Password
                    </label>

                    {/* Forgot Password */}
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                    >
                      Forgot Password?
                    </button>

                  </div>

                  {/* Password Input with Show/Hide */}
                  <div className="relative">

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 pr-12 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        // Eye Off
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3l18 18"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.58 10.58a2 2 0 002.84 2.84"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.88 4.24A10.8 10.8 0 0112 4c5.5 0 9.5 8 9.5 8a17.3 17.3 0 01-3.18 4.24"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.61 6.61C3.95 8.48 2.5 12 2.5 12s4 8 9.5 8c1.04 0 2.02-.17 2.93-.47"
                          />
                        </svg>
                      ) : (
                        // Eye
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="2.5"
                          />
                        </svg>
                      )}
                    </button>

                  </div>

                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-2xl font-bold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md active:scale-[0.99]"
                >
                  Sign In
                </button>

              </form>

              {/* Register */}
              <div className="mt-6 text-center">

                <p className="text-sm text-slate-500">
                  Don't have an account?
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="mt-1 font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Create an account
                </button>

              </div>

              {/* Message */}
              {message && (
                <div
                  className={`mt-5 rounded-xl px-4 py-3 text-center text-lg font-medium ${message === "Login successful!"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                    }`}
                >
                  {message}
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 border-t border-slate-100 pt-6 text-center">

                <p className="text-lg text-slate-600">
                  Medi-Caps University
                </p>

                <p className="mt-1 text-lg text-slate-600">
                  Campus Maintenance Management System
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;
