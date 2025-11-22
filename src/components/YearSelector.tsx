import { ChevronDown } from 'lucide-react'

interface YearSelectorProps {
  selectedYear: string
  onYearChange: (year: string) => void
  years?: {
    start: number
    end: number
  }
  className?: string
}

export default function YearSelector({ 
  selectedYear, 
  onYearChange,
  years = { start: 2000, end: new Date().getFullYear() - 1 },
  className = ''
}: YearSelectorProps) {
  const yearsOptions = Array.isArray(years) ? years : generateYearRange(years.start, years.end)
  return (
    <div className={`relative ${className}`}>
      <label 
        htmlFor="year-select" 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Select Year
      </label>
      <div className="relative">
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                     rounded-lg cursor-pointer appearance-none
                     transition-colors duration-200"
        >
          {yearsOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

/**
 * Generate an array of years from start to end (inclusive)
 */
function generateYearRange(start: number, end: number): string[] {
  const years: string[] = []
  for (let year = end; year >= start; year--) {
    years.push(year.toString())
  }
  return years
}