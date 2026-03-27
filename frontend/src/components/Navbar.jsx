import { Link, NavLink } from "react-router";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/logo.svg";

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navLinks = [
    { href: "/", label: "Home", auth_req: false },
    { href: "/login", label: "Login", auth_req: false },
    { href: "/register", label: "Register", auth_req: false },
    { href: "/employees", label: "Employees", auth_req: true },
    { href: "/departments", label: "Departments", auth_req: true },
    { href: "/positions", label: "Positions", auth_req: true },
  ];

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <Link to="/">
              <img src={logo} alt="Logo" className="h-8" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:space-x-4 items-center">
            {navLinks.map((link) =>
              isAuthenticated === link.auth_req ? (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    `text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? "bg-blue-100 text-blue-700" : ""
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ) : null,
            )}
            {isAdmin && (
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? "bg-blue-100 text-blue-700" : ""
                  }`
                }
              >
                Users
              </NavLink>
            )}
            {isAuthenticated && (
              <button
                onClick={logout}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
