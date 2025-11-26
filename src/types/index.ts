// World Bank API Response Types

export interface WorldBankIndicatorValue {
  indicator: {
    id: string
    value: string
  }
  country: {
    id: string
    value: string
  }
  countryiso3code: string
  date: string
  value: number | null
  unit: string
  obs_status: string
  decimal: number
}

export interface WorldBankMetadata {
  page: number
  pages: number
  per_page: number
  total: number
  sourceid: string
  lastupdated: string
}

export type WorldBankApiResponse = [WorldBankMetadata, WorldBankIndicatorValue[]]

// Indicator codes
export const INDICATORS = {
  GDP_PER_CAPITA: 'NY.GDP.PCAP.CD',
  CO2_PER_CAPITA: 'EN.GHG.CO2.PC.CE.AR5',
  RENEWABLE_ENERGY: 'EG.FEC.RNEW.ZS',
} as const

export type IndicatorCode = typeof INDICATORS[keyof typeof INDICATORS]