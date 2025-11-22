/* eslint-disable @typescript-eslint/no-unused-vars */
import type { WorldBankApiResponse, IndicatorCode, WorldBankIndicatorValue } from "@/types"

const BASE_URL = "https://api.worldbank.org/v2"

async function fetchWorldBank(
  endpoint: string,
  params: Record<string, string | number> = {}
): Promise<WorldBankApiResponse> {
  const query = new URLSearchParams({
    format: "json",
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  })

  const url = `${BASE_URL}/${endpoint}?${query.toString()}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`World Bank API error: ${response.statusText}`)
  }

  const data = await response.json()
  if (!Array.isArray(data) || data.length < 2) {
    throw new Error("Unexpected World Bank API response structure.")
  }

  return data as WorldBankApiResponse
}

/** Fetch indicator values for a single country */
export async function fetchCountryIndicator(
  countryCode: string,
  indicator: IndicatorCode,
  dateRange: string = '1990:2022',
  perPage: number = 100,
): Promise<WorldBankIndicatorValue[]> {
  const [_, values] = await fetchWorldBank(`country/${countryCode}/indicator/${indicator}`, {
    per_page: perPage,
    date: dateRange,
  })

  return values
}

/** Fetch indicator values globally */
export async function fetchIndicatorGlobal(
  indicator: IndicatorCode,
  year: string,
): Promise<WorldBankIndicatorValue[]> {
  const [_, values] = await fetchWorldBank(`country/all/indicator/${indicator}`, {
    per_page: 300,
    date: year,
  })

  return values
}