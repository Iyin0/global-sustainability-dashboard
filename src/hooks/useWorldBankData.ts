import { useQuery } from '@tanstack/react-query'
import { fetchIndicatorGlobal, fetchCountryIndicator } from '@/api/worldBank'
import type { IndicatorCode, WorldBankIndicatorValue } from '@/types'

/**
 * Hook to fetch global indicator data for a specific year
 */
export function useGlobalIndicator(indicator: IndicatorCode, year: string) {
  return useQuery({
    queryKey: ['global-indicator', indicator, year],
    queryFn: () => fetchIndicatorGlobal(indicator, year),
    staleTime: 1000 * 60 * 30, // 30 minutes - World Bank data doesn't change often
  })
}

/**
 * Hook to fetch multiple indicators for a country at once
 */
export function useCountryIndicators(countryCode: string, indicators: IndicatorCode[], dateRange: string) {
  return useQuery({
    queryKey: ['country-indicators', countryCode, indicators],
    queryFn: async () => {
      const results = await Promise.all(
        indicators.map(indicator => fetchCountryIndicator(countryCode, indicator, dateRange))
      )
      return results
    },
    staleTime: 1000 * 60 * 30,
    enabled: !!countryCode && indicators.length > 0,
  })
}

/**
 * Transform World Bank API response to map-friendly format
 * Returns Record<countryCode, value>
 */
export function transformIndicatorDataForMap(
  data: WorldBankIndicatorValue[] | undefined
): Record<string, number> {
  if (!data) return {}

  const result: Record<string, number> = {}

  for (const item of data) {
    // World Bank uses ISO3 codes (3 letters), we need ISO2 codes (2 letters)
    // We'll use countryiso3code and convert it
    const iso3 = item.countryiso3code
    const value = item.value

    if (iso3 && value !== null && !isNaN(value)) {
      // Convert ISO3 to ISO2 (we'll need a mapping function)
      const iso2 = convertISO3toISO2(iso3)
      if (iso2) {
        result[iso2] = value
      }
    }
  }

  return result
}

/**
 * Convert ISO3 (3-letter) country codes to ISO2 (2-letter)
 * This is a subset - expand as needed
 */
function convertISO3toISO2(iso3: string): string | null {
  const mapping: Record<string, string> = {
    'USA': 'US',
    'CAN': 'CA',
    'MEX': 'MX',
    'BRA': 'BR',
    'ARG': 'AR',
    'CHL': 'CL',
    'COL': 'CO',
    'PER': 'PE',
    'VEN': 'VE',
    'ECU': 'EC',
    'BOL': 'BO',
    'PRY': 'PY',
    'URY': 'UY',
    'GBR': 'GB',
    'FRA': 'FR',
    'DEU': 'DE',
    'ITA': 'IT',
    'ESP': 'ES',
    'PRT': 'PT',
    'NLD': 'NL',
    'BEL': 'BE',
    'AUT': 'AT',
    'CHE': 'CH',
    'SWE': 'SE',
    'NOR': 'NO',
    'DNK': 'DK',
    'FIN': 'FI',
    'ISL': 'IS',
    'IRL': 'IE',
    'POL': 'PL',
    'CZE': 'CZ',
    'HUN': 'HU',
    'ROU': 'RO',
    'BGR': 'BG',
    'HRV': 'HR',
    'SVN': 'SI',
    'SVK': 'SK',
    'LTU': 'LT',
    'LVA': 'LV',
    'EST': 'EE',
    'RUS': 'RU',
    'UKR': 'UA',
    'BLR': 'BY',
    'MDA': 'MD',
    'GEO': 'GE',
    'ARM': 'AM',
    'AZE': 'AZ',
    'CHN': 'CN',
    'JPN': 'JP',
    'KOR': 'KR',
    'IND': 'IN',
    'IDN': 'ID',
    'THA': 'TH',
    'MYS': 'MY',
    'SGP': 'SG',
    'PHL': 'PH',
    'VNM': 'VN',
    'PAK': 'PK',
    'BGD': 'BD',
    'IRN': 'IR',
    'IRQ': 'IQ',
    'SAU': 'SA',
    'ARE': 'AE',
    'ISR': 'IL',
    'TUR': 'TR',
    'EGY': 'EG',
    'ZAF': 'ZA',
    'NGA': 'NG',
    'KEN': 'KE',
    'ETH': 'ET',
    'GHA': 'GH',
    'TZA': 'TZ',
    'UGA': 'UG',
    'MAR': 'MA',
    'DZA': 'DZ',
    'TUN': 'TN',
    'LBY': 'LY',
    'SDN': 'SD',
    'AUS': 'AU',
    'NZL': 'NZ',
  }

  return mapping[iso3] || null
}

/**
 * Convert ISO2 to ISO3 (reverse mapping)
 */
export function convertISO2toISO3(iso2: string): string | null {
  const mapping: Record<string, string> = {
    'US': 'USA',
    'CA': 'CAN',
    'MX': 'MEX',
    'BR': 'BRA',
    'AR': 'ARG',
    'CL': 'CHL',
    'CO': 'COL',
    'PE': 'PER',
    'VE': 'VEN',
    'EC': 'ECU',
    'BO': 'BOL',
    'PY': 'PRY',
    'UY': 'URY',
    'GB': 'GBR',
    'FR': 'FRA',
    'DE': 'DEU',
    'IT': 'ITA',
    'ES': 'ESP',
    'PT': 'PRT',
    'NL': 'NLD',
    'BE': 'BEL',
    'AT': 'AUT',
    'CH': 'CHE',
    'SE': 'SWE',
    'NO': 'NOR',
    'DK': 'DNK',
    'FI': 'FIN',
    'IS': 'ISL',
    'IE': 'IRL',
    'PL': 'POL',
    'CZ': 'CZE',
    'HU': 'HUN',
    'RO': 'ROU',
    'BG': 'BGR',
    'HR': 'HRV',
    'SI': 'SVN',
    'SK': 'SVK',
    'LT': 'LTU',
    'LV': 'LVA',
    'EE': 'EST',
    'RU': 'RUS',
    'UA': 'UKR',
    'BY': 'BLR',
    'MD': 'MDA',
    'GE': 'GEO',
    'AM': 'ARM',
    'AZ': 'AZE',
    'CN': 'CHN',
    'JP': 'JPN',
    'KR': 'KOR',
    'IN': 'IND',
    'ID': 'IDN',
    'TH': 'THA',
    'MY': 'MYS',
    'SG': 'SGP',
    'PH': 'PHL',
    'VN': 'VNM',
    'PK': 'PAK',
    'BD': 'BGD',
    'IR': 'IRN',
    'IQ': 'IRQ',
    'SA': 'SAU',
    'AE': 'ARE',
    'IL': 'ISR',
    'TR': 'TUR',
    'EG': 'EGY',
    'ZA': 'ZAF',
    'NG': 'NGA',
    'KE': 'KEN',
    'ET': 'ETH',
    'GH': 'GHA',
    'TZ': 'TZA',
    'UG': 'UGA',
    'MA': 'MAR',
    'DZ': 'DZA',
    'TN': 'TUN',
    'LY': 'LBY',
    'SD': 'SDN',
    'AU': 'AUS',
    'NZ': 'NZL',
  }

  return mapping[iso2.toUpperCase()] || null
}