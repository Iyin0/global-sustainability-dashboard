import { Link } from '@tanstack/react-router'
import { useTheme } from '@/context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function Navigation() {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-xl font-bold text-primary-600 dark:text-primary-400"
            >
              Sustainability Dashboard
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                to="/"
                className="[&.active]:text-primary-600 [&.active]:font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Global Overview
              </Link>
              <Link
                to="/compare"
                className="[&.active]:text-primary-600 [&.active]:font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Compare
              </Link>
              <Link
                to="/about"
                className="[&.active]:text-primary-600 [&.active]:font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                About
              </Link>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}