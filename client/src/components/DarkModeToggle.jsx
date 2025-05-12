import { FaSun, FaMoon } from "react-icons/fa";
import { useDarkMode } from "../context/DarkModeContext";

function DarkModeToggle() {
  const { isDarkMode, setIsDarkMode } = useDarkMode();

  return (
    <button
      onClick={() => setIsDarkMode((prev) => !prev)}
      className="absolute top-4 right-4 text-xl text-yellow-400 dark:text-white"
    >
      {isDarkMode ? <FaSun /> : <FaMoon />}
    </button>
  );
}

export default DarkModeToggle;
