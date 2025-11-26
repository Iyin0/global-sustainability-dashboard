/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import BubbleChart, { type BubbleDataPoint } from '@/features/Bubblechart'
import { INDICATORS } from '@/types'
import Loading from '@/components/Loading'
import { useApp } from '@/context/AppContext'

export const Route = createFileRoute('/compare')({
  component: CompareComponent,
})

interface CountryData {
  code: string
  name: string
  region: string
  population: number
  cca2: string
}

interface IndicatorValue {
  country: { id: string; value: string }
  value: number | null
  date: string
}

// Fetch all countries from REST Countries API
async function fetchCountries(): Promise<CountryData[]> {
  const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,region,population')
  if (!response.ok) throw new Error('Failed to fetch countries')
  const data = await response.json()
  
  return data.map((country: any) => ({
    code: country.cca3,
    cca2: country.cca2,
    name: country.name.common,
    region: country.region,
    population: country.population,
  }))
}

// Fetch indicator data for all countries for a specific year
async function fetchIndicatorData(indicator: string, year: string) {
  const response = await fetch(
    `https://api.worldbank.org/v2/country/all/indicator/${indicator}?date=${year}&format=json&per_page=300`
  )
  if (!response.ok) throw new Error(`Failed to fetch ${indicator} data`)
  const data = await response.json()
  
  // World Bank API returns [metadata, data]
  return data[1] || []
}

function CompareComponent() {
  // const [selectedYear, setSelectedYear] = useState('2020')
  // const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  // const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const { 
    selectedYear, 
    setSelectedYear,
    selectedRegions,
    setSelectedRegions,
    compareCountries,
    setCompareCountries 
  } = useApp()
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch countries
  const { data: countries, isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
  })

  // Fetch GDP per capita data
  const { data: gdpData, isLoading: isLoadingGDP } = useQuery({
    queryKey: ['gdp', selectedYear],
    queryFn: () => fetchIndicatorData(INDICATORS.GDP_PER_CAPITA, selectedYear),
  })

  // Fetch CO2 per capita data
  const { data: co2Data, isLoading: isLoadingCO2 } = useQuery({
    queryKey: ['co2', selectedYear],
    queryFn: () => fetchIndicatorData(INDICATORS.CO2_PER_CAPITA, selectedYear),
  })

  // Combine all data
  const chartData = useMemo<BubbleDataPoint[]>(() => {
    if (!countries || !gdpData || !co2Data) return []

    const gdpMap = new Map(gdpData.map((d: IndicatorValue) => [d.country.id, d.value]))
    const co2Map = new Map(co2Data.map((d: IndicatorValue) => [d.country.id, d.value]))

    return countries
      .map(country => {
        const gdp = gdpMap.get(country.cca2)
        const co2 = co2Map.get(country.cca2)

        if (!gdp || gdp === null) return null

        return {
          code: country.code,
          cca2: country.cca2,
          name: country.name,
          gdpPerCapita: gdp,
          co2PerCapita: co2,
          population: country.population,
          region: country.region,
        }
      })
      .filter((d): d is BubbleDataPoint => d !== null)
  }, [countries, gdpData, co2Data])

  // Get unique regions
  const regions = useMemo(() => {
    if (!chartData) return []
    return Array.from(new Set(chartData.map(d => d.region))).sort()
  }, [chartData])

  // Filter countries for multi-select
  const filteredCountriesForSelect = useMemo(() => {
    if (!chartData) return []
    return chartData
      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [chartData, searchTerm])

  // Handle region toggle
  const toggleRegion = (region: string) => {
    setSelectedRegions(
      selectedRegions.includes(region) 
        ? selectedRegions.filter(r => r !== region) 
        : [...selectedRegions, region]
    )
  }

  // Handle country toggle
  const toggleCountry = (code: string) => {
    setCompareCountries(
      compareCountries.includes(code) 
        ? compareCountries.filter(c => c !== code) 
        : [...compareCountries, code]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedRegions([])
    setCompareCountries([])
  }

  const isLoading = isLoadingCountries || isLoadingGDP || isLoadingCO2

  // Get stats for display
  const stats = useMemo(() => {
    const total = chartData.length
    let displayed = chartData

    if (selectedRegions.length > 0) {
      displayed = displayed.filter(d => selectedRegions.includes(d.region))
    }

    if (compareCountries.length > 0) {
      displayed = displayed.filter(d => compareCountries.includes(d.code))
    }

    return {
      total,
      displayed: displayed.length,
    }
  }, [chartData, selectedRegions, compareCountries])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Country Comparison
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare countries by GDP per capita, CO₂ emissions, and population. Click any bubble to
          view country details.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Year Selector */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Year</h3>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {Array.from({ length: 11 }, (_, i) => 2020 - i).map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Filter by Region
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {regions.map(region => (
              <label
                key={region}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(region)}
                  onChange={() => toggleRegion(region)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{region}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Country Multi-Select */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Select Countries
          </h3>
          <input
            type="text"
            placeholder="Search countries..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 mb-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div className="space-y-1 max-h-48  h-48 overflow-y-auto">
            {filteredCountriesForSelect.slice(0, 50).map(country => (
              <label
                key={country.code}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded text-sm"
              >
                <input
                  type="checkbox"
                  checked={compareCountries.includes(country.code)}
                  onChange={() => toggleCountry(country.code)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{country.name}</span>
              </label>
            ))}
          </div>
          {filteredCountriesForSelect.length > 50 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Showing first 50 of {filteredCountriesForSelect.length} countries. Use search to
              narrow down.
            </p>
          )}
        </div>
      </div>

      {/* Stats and Clear Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{stats.displayed}</span> of{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{stats.total}</span> countries
        </div>
        {(selectedRegions.length > 0 || compareCountries.length > 0) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Chart */}
      <div className="card">
        {isLoading ? (
          <Loading message={`Loading data for ${selectedYear}...`} />
        ) : chartData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No data available for {selectedYear}. Try selecting a different year.
            </p>
          </div>
        ) : (
          <BubbleChart
            data={chartData}
            selectedRegions={selectedRegions}
            selectedCountries={compareCountries}
            width={1100}
            height={650}
          />
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
          About This Chart
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• <strong>X-axis:</strong> GDP per Capita (logarithmic scale)</li>
          <li>• <strong>Y-axis:</strong> CO₂ Emissions per Capita (logarithmic scale)</li>
          <li>• <strong>Bubble Size:</strong> Population (larger = more people)</li>
          <li>• <strong>Bubble Color:</strong> Geographic region</li>
          <li>• <strong>Interaction:</strong> Hover for details, click to view country page</li>
          <li>• <strong>Filters:</strong> Select regions or specific countries to focus your comparison</li>
          <li>• Data sources: World Bank World Development Indicators & REST Countries API</li>
        </ul>
      </div>
    </div>
  )
}