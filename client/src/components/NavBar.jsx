import { useState } from "react";
import { Link } from "react-router-dom";

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Feed", to: "/", current: true },
    { name: "Problems", to: "/problems", current: false },
    { name: "Contest", to: "/projects", current: false }
  ];

  return (
    <>
      <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Toggle main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                </svg>
              )}
            </button>
          </div>

          {/* Logo & Main Links */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <img
                className="h-8 w-auto"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                alt="Logo"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.to}
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      link.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                    aria-current={link.current ? "page" : undefined}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              

            </div>
          </div>
          

          {/* Profile Section */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <button
              type="button"
              className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-gray-800"
            >
              <span className="sr-only">View notifications</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
            </button>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
  {/* 🔥 Streak */}
  <div className="hidden sm:flex items-center text-orange-400 text-sm font-medium mr-4">
    🔥 5
  </div>
  
  </div>

            {/* Dropdown */}
            <div className="relative ml-3 flex space-x-10">
              <div>
              <button
  type="button"
  onClick={() => setIsDropdownOpen((prev) => !prev)}
  className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-gray-800"
  id="user-menu-button"
  aria-expanded={isDropdownOpen}
  aria-haspopup="true"
>
  <span className="sr-only">Open user menu</span>
  <img
    className="h-8 w-8 rounded-full"
    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    alt=""
  />
</button>
              </div>
              {/* ☕ Buy Me a Coffee */}
  <a
    href="https://www.buymeacoffee.com/yourusername"
    target="_blank"
    rel="noopener noreferrer"
    className="hidden sm:inline-flex items-center gap-1 rounded-md bg-yellow-300 px-3 py-1.5 text-sm font-semibold text-black hover:bg-yellow-300 mr-4"
  >
    ☕ Buy me a coffee
  </a>

              

              {isDropdownOpen && (
  <div
    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5"
    role="menu"
    aria-orientation="vertical"
    aria-labelledby="user-menu-button"
  >
    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700" role="menuitem">
      Your Profile
    </Link>
    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700" role="menuitem">
      Settings
    </Link>
    <Link to="/logout" className="block px-4 py-2 text-sm text-gray-700" role="menuitem">
      Sign out
    </Link>
  </div>
)}

            </div>
            
          </div>
          
        </div>
        
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className={`block rounded-md px-3 py-2 text-base font-medium ${
                link.current
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              aria-current={link.current ? "page" : undefined}
            >
              {link.name}
            </Link>
          ))}
    
          {/* ☕ Buy Me a Coffee on Mobile */}
          <a
            href="https://www.buymeacoffee.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md bg-yellow-200 px-3 py-2 text-base font-semibold text-black hover:bg-yellow-300"
          >
            ☕ Buy me a coffee
          </a>
        </div>
      </div>
      )}
    </nav>
    </>
    
  );
}

export default NavBar;
