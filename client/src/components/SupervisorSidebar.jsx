
import { useState } from "react";
import { NavLink } from "react-router-dom";

function SupervisorSidebar({ onLogout }) {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/supervisor/dashboard",
      icon: "⌂",
    },
    {
      name: "Complaints",
      path: "/supervisor/complaints",
      icon: "▤",
    },
    {
      name: "Technicians",
      path: "/supervisor/technicians",
      icon: "◉",
    },
    {
      name: "Notifications",
      path: "/supervisor/notifications",
      icon: "🔔",
    },
    {
      name: "AI Chatbot",
      path: "/supervisor/ai-chatbot",
      icon: "🤖",
    },
    {
      name: "Settings",
      path: "/supervisor/settings",
      icon: "⚙",
    },
  ];

  return (
    <>
      {/* Sidebar Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-5 z-50 flex h-15 w-15 items-center justify-center rounded-xl border border-indigo-100 bg-white text-lg font-bold text-indigo-600 shadow-md transition-all duration-300 hover:bg-indigo-50 hover:shadow-lg ${
          isOpen ? "left-[270px]" : "left-5"
        }`}
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isOpen ? "‹" : "☰"}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-[1px] lg:hidden"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen overflow-hidden border-r border-indigo-100 bg-gradient-to-b from-indigo-50 via-white to-slate-50 shadow-xl transition-all duration-300 ${
          isOpen
            ? "w-64 translate-x-0"
            : "w-64 -translate-x-full"
        } lg:translate-x-0 ${
          isOpen ? "lg:w-64" : "lg:w-20"
        }`}
      >
        {/* Decorative Background */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-indigo-100/60 blur-3xl"></div>

        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-indigo-100/50 blur-3xl"></div>

        {/* Brand */}
        <div
          className={`relative flex h-24 items-center border-b border-indigo-100 bg-white/80 backdrop-blur-sm ${
            isOpen
              ? "justify-between px-5"
              : "justify-center px-2"
          }`}
        >
          {isOpen ? (
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl font-black text-white shadow-md shadow-indigo-200">
                C
              </div>

              <div>
                <h1 className="text-xl font-black tracking-tight text-indigo-700">
                  CampusFix
                </h1>

                <p className="mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Supervisor Portal
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl font-black text-white shadow-md shadow-indigo-200">
              C
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="relative px-3 py-7">
          {isOpen && (
            <div className="mb-4 px-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                Operations
              </p>
            </div>
          )}

          <div className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/supervisor/dashboard"}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
                title={!isOpen ? item.name : ""}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-2xl transition-all duration-200 ${
                    isOpen
                      ? "gap-4 px-4 py-3.5"
                      : "justify-center px-2 py-3.5"
                  } ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white"></span>
                    )}

                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold transition ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                      }`}
                    >
                      {item.icon}
                    </span>

                    {isOpen && (
                      <span
                        className={`truncate text-[15px] tracking-wide ${
                          isActive
                            ? "font-extrabold"
                            : "font-bold"
                        }`}
                      >
                        {item.name}
                      </span>
                    )}

                    {isOpen && isActive && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-white"></span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div
          className={`absolute bottom-0 left-0 right-0 border-t border-indigo-100 bg-white/90 backdrop-blur-sm ${
            isOpen ? "p-4" : "p-2"
          }`}
        >
          {isOpen && (
            <div className="mb-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-black text-white shadow-sm">
                  S
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-800">
                    Supervisor
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>

                    <span className="text-[10px] font-bold text-slate-500">
                      System Operational
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onLogout}
            title={!isOpen ? "Logout" : ""}
            className={`group flex w-full items-center rounded-xl text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 ${
              isOpen
                ? "gap-4 px-4 py-3"
                : "justify-center px-2 py-3"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-base font-bold text-slate-500 transition group-hover:bg-red-100 group-hover:text-red-600">
              ↪
            </span>

            {isOpen && (
              <span className="text-sm font-bold">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default SupervisorSidebar;
