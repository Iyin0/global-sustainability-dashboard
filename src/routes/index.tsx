import { createFileRoute } from '@tanstack/react-router'
import ChoroplethMap from '@/features/ChoroplethMap'
import MapLegend from '@/features/MapLegend'
import YearSelector from '@/components/YearSelector'
import { useGlobalIndicator, transformIndicatorDataForMap } from '@/hooks/useWorldBankData'
import { INDICATORS } from '@/types'
import Loading from '@/components/Loading'
import { useApp } from '@/context/AppContext'

export const Route = createFileRoute('/')({
  component: IndexComponent,
})

function IndexComponent() {
  // Year state - updates when user selects from dropdown
  const { selectedYear, setSelectedYear } = useApp()

  // Fetch renewable energy data from World Bank API
  // This automatically refetches when selectedYear changes!
  const { data: renewable, isLoading, isError, error } = useGlobalIndicator(
    INDICATORS.RENEWABLE_ENERGY,
    selectedYear,
  )

  // Transform API data to map format (ISO2 code -> value)
  const mapData = transformIndicatorDataForMap(renewable)

  // Calculate min/max for legend
  const values = Object.values(mapData)
  const minValue = values.length > 0 ? Math.min(...values) : 0
  const maxValue = values.length > 0 ? Math.max(...values) : 100

  // Loading state
  if (isLoading) {
    return (
      <Loading message="Loading global renewable energy data..." />
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Data
          </h2>
          <p className="text-red-600 dark:text-red-300">
            {error instanceof Error ? error.message : 'Failed to load data from World Bank API'}
          </p>
        </div>
      </div>
    )
  }

  // No data state
  if (!renewable || renewable.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card">
          <p className="text-gray-600 dark:text-gray-400">No data available for {selectedYear}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              Global Sustainability Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Explore renewable energy consumption across the world
            </p>
          </div>
          
          {/* Year Selector */}
          <div className="sm:w-48">
            <YearSelector 
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </div>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Showing data for {renewable.length} countries • Year: {selectedYear}
        </p>
      </div>

      <div className="card flex flex-col gap-6">
        {/* Map */}
        <div className="flex-1">
          <div className="">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Renewable Energy by Country ({selectedYear})
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Click on a country to view detailed information
              </p>
            </div>
            <div className="flex overflow-x-auto justify-center">
              <ChoroplethMap 
                data={mapData} 
                width={960}
                height={600}
              />
            </div>
          </div>
        </div>

        {/* Legend and Info */}
        <div className="flex justify-center">
          <MapLegend 
            min={minValue} 
            max={maxValue} 
            title="Renewable Energy Consumption(%)"
          />
          
          <div className="card mt-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Instructions
            </h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Select a year from the dropdown above</li>
              <li>• Hover over countries to see details</li>
              <li>• Click on a country to view full data</li>
              <li>• Darker colors = higher renewable energy %</li>
              <li>• Gray = no data available</li>
            </ul>
          </div>

          <div className="card mt-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Data Source
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              World Bank - World Development Indicators
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Renewable energy consumption (% of total final energy consumption)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}