import { useState } from 'react'

interface YearRangeSelectorProps {
  minYear: number
  maxYear: number
  selectedStart: number
  selectedEnd: number
  onRangeChange: (start: number, end: number) => void
  className?: string
}

export default function YearRangeSelector({
  minYear,
  maxYear,
  selectedStart,
  selectedEnd,
  onRangeChange,
  className = '',
}: YearRangeSelectorProps) {
  const [start, setStart] = useState(selectedStart)
  const [end, setEnd] = useState(selectedEnd)

  const handleStartChange = (value: string) => {
    const year = parseInt(value)
    if (year <= selectedEnd) {
      setStart(year)
      onRangeChange(year, selectedEnd)
    }
  }

  const handleEndChange = (value: string) => {
    const year = parseInt(value)
    if (year >= selectedStart) {
      setEnd(year)
      onRangeChange(selectedStart, year)
    }
  }

  // Generate year options
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i
  )

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Year Range
      </label>
      
      <div className="flex items-center gap-3">
        {/* Start Year */}
        <div className="flex-1">
          <label 
            htmlFor="start-year" 
            className="block text-xs text-gray-600 dark:text-gray-400 mb-1"
          >
            From
          </label>
          <select
            id="start-year"
            value={start}
            onChange={(e) => handleStartChange(e.target.value)}
            className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                       rounded-lg cursor-pointer"
          >
            {years
              .filter(y => y <= end)
              .map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
          </select>
        </div>

        {/* Separator */}
        <div className="text-gray-400 dark:text-gray-500 mt-6">—</div>

        {/* End Year */}
        <div className="flex-1">
          <label 
            htmlFor="end-year" 
            className="block text-xs text-gray-600 dark:text-gray-400 mb-1"
          >
            To
          </label>
          <select
            id="end-year"
            value={end}
            onChange={(e) => handleEndChange(e.target.value)}
            className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                       rounded-lg cursor-pointer"
          >
            {years
              .filter(y => y >= start)
              .map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Visual indicator */}
      <div className="text-xs text-gray-500 dark:text-gray-500 text-center">
        Showing {end - start + 1} years ({start}–{end})
      </div>
    </div>
  )
}