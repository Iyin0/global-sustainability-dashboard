import { fetchCountryCoordinates, fetchWeatherData } from '@/api/weatherData'
import { useQuery } from '@tanstack/react-query'

export function useWeatherData(latitude: number, longitude: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['weather', latitude, longitude],
    queryFn: () => fetchWeatherData(latitude, longitude),
    enabled: enabled && !!latitude && !!longitude,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export function useCountriesCoordinates(countryCodeUpper: string) {
  return useQuery({
    queryKey: ['country-coords', countryCodeUpper],
    queryFn: () => fetchCountryCoordinates(countryCodeUpper),
  })
}
