import { WeatherData, WeatherDataPoint } from "@/types/weather"

export async function fetchWeatherData(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 12) // Last 12 months

  const start = startDate.toISOString().split('T')[0]
  const end = endDate.toISOString().split('T')[0]

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${start}&end_date=${end}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch weather data')
  }

  const data = await response.json()

  const daily: WeatherDataPoint[] = data.daily.time.map((date: string, i: number) => ({
    date,
    maxTemp: data.daily.temperature_2m_max[i],
    minTemp: data.daily.temperature_2m_min[i],
    precipitation: data.daily.precipitation_sum[i],
  }))

  return {
    daily,
    location: {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
    },
  }
}

// Fetch country coordinates from REST Countries API
export async function fetchCountryCoordinates(code: string) {
  const response = await fetch(
    `https://restcountries.com/v3.1/alpha/${code}?fields=name,latlng,capital`
  )
  if (!response.ok) throw new Error('Failed to fetch country data')
  const data = await response.json()

  return {
    name: data.name.common,
    capital: data.capital?.[0] || data.name.common,
    latitude: data.latlng[0],
    longitude: data.latlng[1],
  }
}