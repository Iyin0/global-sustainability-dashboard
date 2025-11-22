export type WeatherDataPoint = {
  date: string
  maxTemp: number | null
  minTemp: number | null
  precipitation: number | null
}

export type WeatherData = {
  daily: WeatherDataPoint[]
  location: {
    latitude: number
    longitude: number
    timezone: string
  }
}