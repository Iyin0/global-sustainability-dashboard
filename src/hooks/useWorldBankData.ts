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
    const iso2 = item.country.id
    const value = item.value

    if (iso2 && value !== null && !isNaN(value)) {
      result[iso2] = value
    }
  }

  return result
}

/**
 * Convert ISO2 to ISO3 (reverse mapping)
 */
export function convertISO2toISO3(iso2: string): string | null {
  const mapping: Record<string, string> = {

    'AD': 'AND',
    'AE': 'ARE',
    'AF': 'AFG',
    'AG': 'ATG',
    'AL': 'ALB',
    'AM': 'ARM',
    'AO': 'AGO',
    'AQ': 'ATA',
    'AR': 'ARG',
    'AS': 'ASM',
    'AT': 'AUT',
    'AU': 'AUS',
    'AW': 'ABW',
    'AZ': 'AZE',

    'BA': 'BIH',
    'BB': 'BRB',
    'BD': 'BGD',
    'BE': 'BEL',
    'BF': 'BFA',
    'BG': 'BGR',
    'BH': 'BHR',
    'BI': 'BDI',
    'BJ': 'BEN',
    'BN': 'BRN',
    'BO': 'BOL',
    'BR': 'BRA',
    'BS': 'BHS',
    'BT': 'BTN',
    'BW': 'BWA',
    'BY': 'BLR',
    'BZ': 'BLZ',

    'CA': 'CAN',
    'CD': 'COD',
    'CF': 'CAF',
    'CG': 'COG',
    'CH': 'CHE',
    'CI': 'CIV',
    'CL': 'CHL',
    'CM': 'CMR',
    'CN': 'CHN',
    'CO': 'COL',
    'CR': 'CRI',
    'CU': 'CUB',
    'CV': 'CPV',
    'CY': 'CYP',
    'CZ': 'CZE',

    'DE': 'DEU',
    'DJ': 'DJI',
    'DK': 'DNK',
    'DM': 'DMA',
    'DO': 'DOM',
    'DZ': 'DZA',

    'EC': 'ECU',
    'EE': 'EST',
    'EG': 'EGY',
    'EH': 'ESH',
    'ER': 'ERI',
    'ES': 'ESP',
    'ET': 'ETH',

    'FI': 'FIN',
    'FJ': 'FJI',
    'FK': 'FLK',
    'FM': 'FSM',
    'FR': 'FRA',

    'GA': 'GAB',
    'GB': 'GBR',
    'GD': 'GRD',
    'GE': 'GEO',
    'GF': 'GUF',
    'GH': 'GHA',
    'GI': 'GIB',
    'GL': 'GRL',
    'GM': 'GMB',
    'GN': 'GIN',
    'GQ': 'GNQ',
    'GR': 'GRC',
    'GT': 'GTM',
    'GU': 'GUM',
    'GW': 'GNB',
    'GY': 'GUY',

    'HK': 'HKG',
    'HN': 'HND',
    'HR': 'HRV',
    'HT': 'HTI',
    'HU': 'HUN',

    'ID': 'IDN',
    'IE': 'IRL',
    'IL': 'ISR',
    'IN': 'IND',
    'IQ': 'IRQ',
    'IR': 'IRN',
    'IS': 'ISL',
    'IT': 'ITA',

    'JM': 'JAM',
    'JO': 'JOR',
    'JP': 'JPN',

    'KE': 'KEN',
    'KG': 'KGZ',
    'KH': 'KHM',
    'KI': 'KIR',
    'KM': 'COM',
    'KN': 'KNA',
    'KP': 'PRK',
    'KR': 'KOR',
    'KW': 'KWT',
    'KY': 'CYM',
    'KZ': 'KAZ',

    'LA': 'LAO',
    'LB': 'LBN',
    'LC': 'LCA',
    'LI': 'LIE',
    'LK': 'LKA',
    'LR': 'LBR',
    'LS': 'LSO',
    'LT': 'LTU',
    'LU': 'LUX',
    'LV': 'LVA',
    'LY': 'LBY',

    'MA': 'MAR',
    'MC': 'MCO',
    'MD': 'MDA',
    'ME': 'MNE',
    'MG': 'MDG',
    'MH': 'MHL',
    'MK': 'MKD',
    'ML': 'MLI',
    'MM': 'MMR',
    'MN': 'MNG',
    'MO': 'MAC',
    'MP': 'MNP',
    'MQ': 'MTQ',
    'MR': 'MRT',
    'MS': 'MSR',
    'MT': 'MLT',
    'MU': 'MUS',
    'MV': 'MDV',
    'MW': 'MWI',
    'MX': 'MEX',
    'MY': 'MYS',
    'MZ': 'MOZ',

    'NA': 'NAM',
    'NC': 'NCL',
    'NE': 'NER',
    'NF': 'NFK',
    'NG': 'NGA',
    'NI': 'NIC',
    'NL': 'NLD',
    'NO': 'NOR',
    'NP': 'NPL',
    'NR': 'NRU',
    'NU': 'NIU',
    'NZ': 'NZL',

    'OM': 'OMN',

    'PA': 'PAN',
    'PE': 'PER',
    'PF': 'PYF',
    'PG': 'PNG',
    'PH': 'PHL',
    'PK': 'PAK',
    'PL': 'POL',
    'PM': 'SPM',
    'PN': 'PCN',
    'PR': 'PRI',
    'PS': 'PSE',
    'PT': 'PRT',
    'PW': 'PLW',
    'PY': 'PRY',

    'QA': 'QAT',

    'RE': 'REU',
    'RO': 'ROU',
    'RS': 'SRB',
    'RU': 'RUS',
    'RW': 'RWA',

    'SA': 'SAU',
    'SB': 'SLB',
    'SC': 'SYC',
    'SD': 'SDN',
    'SE': 'SWE',
    'SG': 'SGP',
    'SH': 'SHN',
    'SI': 'SVN',
    'SJ': 'SJM',
    'SK': 'SVK',
    'SL': 'SLE',
    'SM': 'SMR',
    'SN': 'SEN',
    'SO': 'SOM',
    'SR': 'SUR',
    'SS': 'SSD',
    'ST': 'STP',
    'SV': 'SLV',
    'SX': 'SXM',
    'SY': 'SYR',
    'SZ': 'SWZ',

    'TC': 'TCA',
    'TD': 'TCD',
    'TF': 'ATF',
    'TG': 'TGO',
    'TH': 'THA',
    'TJ': 'TJK',
    'TK': 'TKL',
    'TL': 'TLS',
    'TM': 'TKM',
    'TN': 'TUN',
    'TO': 'TON',
    'TR': 'TUR',
    'TT': 'TTO',
    'TV': 'TUV',
    'TW': 'TWN',
    'TZ': 'TZA',

    'UA': 'UKR',
    'UG': 'UGA',
    'UM': 'UMI',
    'US': 'USA',
    'UY': 'URY',
    'UZ': 'UZB',

    'VA': 'VAT',
    'VC': 'VCT',
    'VE': 'VEN',
    'VG': 'VGB',
    'VI': 'VIR',
    'VN': 'VNM',
    'VU': 'VUT',

    'WF': 'WLF',
    'WS': 'WSM',

    'XK': 'XKX',     // Kosovo (non-ISO)
    'SO-SL': 'SML',  // Somaliland (placeholder)

    'YE': 'YEM',
    'YT': 'MYT',

    'ZA': 'ZAF',
    'ZM': 'ZMB',
    'ZW': 'ZWE'
  };

  return mapping[iso2] ?? null;
}