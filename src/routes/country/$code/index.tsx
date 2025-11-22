/* eslint-disable react-hooks/exhaustive-deps */
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, CloudRain } from 'lucide-react'
import { useCountryIndicators, convertISO2toISO3 } from '@/hooks/useWorldBankData'
import { INDICATORS } from '@/types'
import MultiSeriesLineChart from '@/features/Multiserieslinechart'
import { toTimeSeries, normalizeTimeSeries, fillTimeSeriesGaps, getYearRange } from '@/lib/chartUtils'
import { useEffect, useMemo } from 'react'
import YearRangeSelector from '@/components/YearRangeSelector'
import NormalizationToggle from '@/components/NormalizationToggle'
import StackedAreaChart from '@/features/Stackedareachart'
import Loading from '@/components/Loading'
import { useApp } from '@/context/AppContext'

export const Route = createFileRoute('/country/$code/')({
  component: CountryDetailComponent,
})

function CountryDetailComponent() {
  const { code } = Route.useParams()
  const countryCodeUpper = code.toUpperCase()
  
  // Convert ISO2 to ISO3 for World Bank API
  const iso3Code = convertISO2toISO3(countryCodeUpper)

  // Year range state
  const {
    selectedYearRange,
    setSelectedYearRange,
    normalizationMethod,
    setNormalizationMethod,
  } = useApp()


  // Build date range string for API
  const dateRange = useMemo(
    () => `${selectedYearRange.start}:${selectedYearRange.end}`,
    [selectedYearRange]
  )

  // Fetch all three indicators for the country
  const { data, isLoading, isError, error, refetch } = useCountryIndicators(
    iso3Code || '',
    [
      INDICATORS.GDP_PER_CAPITA,
      INDICATORS.RENEWABLE_ENERGY,
      // INDICATORS.CO2_PER_CAPITA, // Temporarily disabled due to data issues
    ],
    dateRange,
  )

  // Process data for multi-series line chart
  const { normalizedSeries, countryName } = useMemo(() => {
    if (!data || data.every(d => !d || d.length === 0)) {
      return { chartSeries: [], chartDataAvailable: false }
    }

    const [gdpData, renewableData, co2Data] = data

    // Convert to time series
    const series = [
      toTimeSeries(gdpData || [], 'GDP per Capita', '#3b82f6'),
      toTimeSeries(renewableData || [], 'Renewable Energy %', '#10b981'),
      toTimeSeries(co2Data || [], 'CO₂ Emissions per Capita', '#ef4444'),
    ]

    // // Fill gaps for smoother display
    // Get year range from data and fill gaps
    const [dataStartYear, dataEndYear] = getYearRange(series)
    const filledSeries = fillTimeSeriesGaps(series, dataStartYear, dataEndYear)

    // Normalize the series with selected method
    const normalizedSeries = normalizeTimeSeries(filledSeries, normalizationMethod)

    // Get country name from first available data point
    const countryName = 
    gdpData?.[0]?.country?.value || 
    renewableData?.[0]?.country?.value || 
    co2Data?.[0]?.country?.value || 
    countryCodeUpper

    return {
      normalizedSeries,
      countryName,
    }
  }, [data, normalizationMethod])

  // Extract renewable energy data for stacked area chart
  const renewableEnergyData = useMemo(() => {
    if (!data || !data[1]) return []
    return toTimeSeries(data[1], 'Renewable Energy %', '#10b981').data
  }, [data])

  // Calculate insights for stacked area chart
  const { latestRenewable, earliestRenewable, changeInRenewable, avgRenewable } = useMemo(() => {
    const validData = renewableEnergyData.filter(d => d.value !== null)
    if (validData.length === 0) return { latestRenewable: 0, earliestRenewable: 0, changeInRenewable: 0, avgRenewable: 0 }
    
    const latest = validData[validData.length - 1]?.value || 0
    const earliest = validData[0]?.value || 0
    const change = latest - earliest
    const avg = validData.reduce((sum, d) => sum + (d.value || 0), 0) / validData.length
    
    return {
      latestRenewable: latest,
      earliestRenewable: earliest,
      changeInRenewable: change,
      avgRenewable: avg,
    }
  }, [renewableEnergyData])

  // Handle year range change
  const handleRangeChange = (start: number, end: number) => {
    setSelectedYearRange({ start, end })
  }

  useEffect(() => {
    refetch()
  }, [dateRange, refetch])

  const header = (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => {
          // Go back to previous page if available, otherwise fall back to home
          if (window.history.length > 1) {
            window.history.back()
          } else {
            window.location.assign('/')
          }
        }}
        className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {countryName} - Sustainability Indicators
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            ISO3: {iso3Code} | Data from World Bank World Development Indicators
          </p>
        </div>
        
        {/* ADD THIS: Weather Link Button */}
        <Link
          to="/country/$code/weather"
          params={{ code }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <CloudRain className="h-5 w-5" />
          View Weather Data
        </Link>
      </div>
    </div>
  )

  // Loading state
  if (isLoading) {
    return (
      <Loading message={`Loading data for ${countryCodeUpper}...`} />
    )
  }

  // Error state
  if (isError || !iso3Code) {
    return (
      <div className="container mx-auto px-4 py-8">
        {header}
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Data
          </h2>
          <p className="text-red-600 dark:text-red-300">
            {error instanceof Error 
              ? error.message 
              : `Unable to load data for country code: ${countryCodeUpper}`}
          </p>
        </div>
      </div>
    )
  }

  // No data state
  if (!data || data.every(d => !d || d.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        {header}
        <div className="card">
          <p className="text-gray-600 dark:text-gray-400">
            No data available for {countryCodeUpper}
          </p>
        </div>
      </div>
    )
  }
  
  const [gdpData, renewableData, co2Data] = data

  return (
    <div className="container mx-auto px-4 py-8">
      {header}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <YearRangeSelector
            minYear={1990}
            maxYear={2022}
            selectedStart={selectedYearRange.start}
            selectedEnd={selectedYearRange.end}
            onRangeChange={handleRangeChange}
          />
        </div>
        
        <div className="card">
          <NormalizationToggle
            method={normalizationMethod}
            onMethodChange={setNormalizationMethod}
          />
        </div>
      </div>

      {/* Multi-Series Line Chart */}
      <div className="card mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Sustainability Indicators Over Time
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {normalizationMethod === 'minmax' 
              ? 'All indicators are normalized to 0-1 scale (min-max) to enable visual comparison.'
              : 'All indicators are standardized using z-scores (standard deviations from mean).'
            } Hover over the chart to see original values. Click legend items to toggle series.
          </p>
        </div>
        
        <div className="flex justify-center">
          <MultiSeriesLineChart 
            series={normalizedSeries || []}
            width={900}
            height={450}
            normalizationMethod={normalizationMethod}
          />
        </div>
      </div>

      {/* Data Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GDP Card */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              GDP per Capita
            </h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Latest:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {gdpData && gdpData.length > 0
                  ? `$${gdpData[0].value?.toLocaleString() || 'N/A'}`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Year:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {gdpData && gdpData.length > 0 ? gdpData[0].date : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Data Points:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {gdpData?.filter(d => d.value !== null).length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Renewable Energy Card */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Renewable Energy
            </h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Latest:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {renewableData && renewableData.length > 0
                  ? `${renewableData[0].value?.toFixed(1) || 'N/A'}%`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Year:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {renewableData && renewableData.length > 0 ? renewableData[0].date : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Data Points:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {renewableData?.filter(d => d.value !== null).length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* CO2 Card */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              CO₂ Emissions
            </h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Latest:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {co2Data && co2Data.length > 0
                  ? `${co2Data[0].value?.toFixed(2) || 'N/A'} tons`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Year:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {co2Data && co2Data.length > 0 ? co2Data[0].date : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Data Points:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {co2Data?.filter(d => d.value !== null).length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="card mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          About This Data
        </h3>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>
            • <strong>Normalization:</strong> {normalizationMethod === 'minmax' 
              ? 'Min-Max scales values to 0-1 range for easy comparison'
              : 'Z-Score standardizes values by standard deviations from mean'
            }
          </li>
          <li>• Original values shown in tooltip on hover</li>
          <li>• Missing years appear as gaps in the lines</li>
          <li>• Use controls above to adjust year range and normalization method</li>
          <li>• Click legend items to show/hide individual indicators</li>
          <li>• Source: World Bank World Development Indicators</li>
        </ul>
      </div>


      {/* Stacked Area Chart - Renewable Energy Composition */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Energy Mix: Renewable vs Non-Renewable
        </h2>
        
        {renewableEnergyData.length > 0 ? (
          <>
            <StackedAreaChart
              data={renewableEnergyData}
              width={1000}
              height={400}
            />
            
            {/* Insights section */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Current Renewable Share
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                  {latestRenewable.toFixed(1)}%
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Starting Renewable Share
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                  {earliestRenewable.toFixed(1)}%
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Change Over Time
                </div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                  {changeInRenewable > 0 ? '+' : ''}{changeInRenewable.toFixed(1)}%
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                  Average Renewable Share
                </div>
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
                  {avgRenewable.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Chart explanation */}
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
                About This Chart
              </h3>
              <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                <li>• Shows the composition of energy sources over time</li>
                <li>• Green area represents renewable energy percentage</li>
                <li>• Red area represents non-renewable energy percentage</li>
                <li>• Areas always stack to 100% total energy</li>
                <li>• Hover over the chart to see exact percentages for each year</li>
                <li>• Data source: World Bank - Renewable energy consumption (% of total final energy consumption)</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No renewable energy data available for the selected time period.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}