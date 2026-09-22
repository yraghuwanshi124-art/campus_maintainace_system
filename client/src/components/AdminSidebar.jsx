
import { useState } from "react";
import { NavLink } from "react-router-dom";

function AdminSidebar({ onLogout }) {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: "⌂",
    },
    {
      name: "Technicians",
      path: "/admin/technicians",
      icon: "◉",
    },
    {
      name: "Monthly Reports",
      path: "/admin/monthly-report",
      icon: "▥",
    },
    {
      name: "All Complaints",
      path: "/admin/complaints",
      icon: "▤",
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: "⚙",
    },
  ];

  return (
    <>
      {/* Sidebar Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-5 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-base font-semibold text-slate-600 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 ${
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
          className="fixed inset-0 z-30 bg-slate-900/25 lg:hidden"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-white shadow-lg transition-all duration-300 ${
          isOpen
            ? "w-64 translate-x-0"
            : "w-64 -translate-x-full"
        } lg:translate-x-0 ${
          isOpen ? "lg:w-64" : "lg:w-20"
        }`}
      >
        {/* Header / Brand */}
        <div
          className={`flex h-20 items-center border-b border-slate-100 ${
            isOpen
              ? "justify-between px-5"
              : "justify-center px-2"
          }`}
        >
          {isOpen ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-black text-white shadow-sm">
                C
              </div>

              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-800">
                  CampusFix
                </h1>

                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Administration
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-black text-white shadow-sm">
              C
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-3 py-6">
          {isOpen && (
            <div className="mb-3 px-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                Main Menu
              </p>
            </div>
          )}

          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
                title={!isOpen ? item.name : ""}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-xl transition-all duration-200 ${
                    isOpen
                      ? "gap-3 px-3 py-2.5"
                      : "justify-center px-2 py-3"
                  } ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600"></span>
                    )}

                    {/* Icon */}
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-base font-bold transition-all ${
                        isActive
                          ? "border-indigo-100 bg-white text-indigo-600"
                          : "border-transparent bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-indigo-600"
                      }`}
                    >
                      {item.icon}
                    </span>

                    {/* Label */}
                    {isOpen && (
                      <span
                        className={`truncate text-sm ${
                          isActive
                            ? "font-bold"
                            : "font-semibold"
                        }`}
                      >
                        {item.name}
                      </span>
                    )}

                    {/* Active Dot */}
                    {isOpen && isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom Area */}
        <div
          className={`absolute bottom-5 ${
            isOpen ? "left-3 right-3" : "left-2 right-2"
          }`}
        >
          {/* System Status */}
          {isOpen && (
            <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>

                <div>
                  <p className="text-xs font-bold text-slate-700">
                    System Operational
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    All services running
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            title={!isOpen ? "Logout" : ""}
            className={`group flex w-full items-center rounded-xl text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 ${
              isOpen
                ? "gap-3 px-3 py-2.5"
                : "justify-center px-2 py-3"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-base font-bold text-slate-500 transition group-hover:bg-red-100 group-hover:text-red-600">
              ↪
            </span>

            {isOpen && (
              <span className="text-sm font-semibold">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
