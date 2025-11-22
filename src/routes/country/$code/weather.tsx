import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useCountriesCoordinates, useWeatherData } from '@/hooks/useWeatherData'
import TemperatureLineChart from '@/features/Temperaturelinechart'
import CalendarHeatmap from '@/features/Calendarheatmap'
import { useMemo } from 'react'
import * as d3 from 'd3'
import Loading from '@/components/Loading'

export const Route = createFileRoute('/country/$code/weather')({
  component: WeatherComponent,
})

function WeatherComponent() {
  const { code } = Route.useParams()
  const countryCodeUpper = code.toUpperCase()

  // Fetch country coordinates
  const {
    data: countryData,
    isLoading: isLoadingCountry,
    isError: isCountryError,
  } = useCountriesCoordinates(countryCodeUpper)

  // Fetch weather data
  const {
    data: weatherData,
    isLoading: isLoadingWeather,
    isError: isWeatherError,
  } = useWeatherData(
    countryData?.latitude || 0,
    countryData?.longitude || 0,
    !!countryData
  )

   // Calculate statistics
  const stats = useMemo(() => {
    if (!weatherData?.daily) return null

    const temps = weatherData.daily
      .filter(d => d.maxTemp !== null && d.minTemp !== null)
      .flatMap(d => [d.maxTemp!, d.minTemp!])

    const precip = weatherData.daily
      .filter(d => d.precipitation !== null)
      .map(d => d.precipitation!)

    const rainyDays = precip.filter(p => p > 0).length
    const totalPrecipitation = d3.sum(precip)

    return {
      avgTemp: d3.mean(temps)?.toFixed(1) || '0',
      maxTemp: d3.max(temps)?.toFixed(1) || '0',
      minTemp: d3.min(temps)?.toFixed(1) || '0',
      totalPrecipitation: totalPrecipitation.toFixed(0),
      rainyDays,
      avgPrecipitation: (totalPrecipitation / weatherData.daily.length).toFixed(1),
    }
  }, [weatherData])

  const isLoading = isLoadingCountry || isLoadingWeather
  const isError = isCountryError || isWeatherError

  if (isLoading) {
    return (
      <Loading message={`Loading weather data for ${countryCodeUpper}...`} />
    )
  }

  if (isError || !countryData || !weatherData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/country/$code"
          params={{ code }}
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Country
        </Link>
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Weather Data
          </h2>
          <p className="text-red-600 dark:text-red-300">
            Failed to load weather data for {countryCodeUpper}. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/country/$code"
          params={{ code }}
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Country
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Weather Data - {countryData.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Capital: {countryData.capital} • Coordinates: {countryData.latitude.toFixed(2)}°,{' '}
          {countryData.longitude.toFixed(2)}°
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          Data from Open-Meteo API • Last 12 months
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="card bg-linear-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800">
          <div className="text-sm text-red-600 dark:text-red-400 font-medium">Max Temp</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
            {stats?.maxTemp}°C
          </div>
        </div>

        <div className="card bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Min Temp</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
            {stats?.minTemp}°C
          </div>
        </div>

        <div className="card bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">Avg Temp</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
            {stats?.avgTemp}°C
          </div>
        </div>

        <div className="card bg-linear-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-cyan-200 dark:border-cyan-800">
          <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">
            Total Precipitation
          </div>
          <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300 mt-1">
            {stats?.totalPrecipitation} mm
          </div>
        </div>

        <div className="card bg-linear-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Rainy Days</div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
            {stats?.rainyDays}
          </div>
        </div>

        <div className="card bg-linear-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800">
          <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">
            Avg Precipitation
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
            {stats?.avgPrecipitation} mm/day
          </div>
        </div>
      </div>

      {/* Temperature Line Chart */}
      <div className="card mb-6">
        <TemperatureLineChart data={weatherData.daily} width={1100} height={400} />

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
            About This Chart
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• <strong>Red line:</strong> Daily maximum temperature</li>
            <li>• <strong>Blue line:</strong> Daily minimum temperature</li>
            <li>• <strong>Shaded area:</strong> Temperature range for each day</li>
            <li>• Hover over the chart to see exact values for any date</li>
            <li>• Data represents the capital city: {countryData.capital}</li>
          </ul>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="card">
        <CalendarHeatmap data={weatherData.daily} width={1100} height={350} />

        <div className="mt-4 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
          <h3 className="text-sm font-semibold text-cyan-900 dark:text-cyan-200 mb-2">
            About This Chart
          </h3>
          <ul className="text-sm text-cyan-800 dark:text-cyan-300 space-y-1">
            <li>• Each cell represents one day of the year</li>
            <li>• <strong>Color intensity:</strong> Amount of precipitation (darker = more rain)</li>
            <li>• <strong>Gray cells:</strong> No precipitation</li>
            <li>• Hover over any cell to see exact precipitation amount</li>
            <li>• Rows represent days of the week (Sunday to Saturday)</li>
            <li>• Columns represent weeks of the year</li>
          </ul>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 card bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">
          Data Source & Notes
        </h3>
        <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
          <li>
            • Weather data from <strong>Open-Meteo Archive API</strong> (free, no API key required)
          </li>
          <li>• Data represents historical weather for the past 12 months</li>
          <li>• Location: Capital city coordinates ({countryData.capital})</li>
          <li>• Temperature measured at 2 meters above ground</li>
          <li>• Precipitation measured as daily sum in millimeters</li>
          <li>• Timezone: {weatherData.location.timezone}</li>
        </ul>
      </div>
    </div>
  )
}