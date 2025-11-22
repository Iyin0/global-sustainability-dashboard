import type { WorldBankIndicatorValue } from '@/types'

/**
 * Normalize data using min-max normalization
 * Formula: (value - min) / (max - min)
 * Result: Values between 0 and 1
 */
export function normalizeMinMax(values: number[]): number[] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min

  if (range === 0) return values.map(() => 0.5) // All same value

  return values.map(v => (v - min) / range)
}

/**
 * Normalize data using z-score normalization
 * Formula: (value - mean) / stdDev
 * Result: Values centered around 0
 */
export function normalizeZScore(values: number[]): number[] {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)

  if (stdDev === 0) return values.map(() => 0) // No variation

  return values.map(v => (v - mean) / stdDev)
}

/**
 * Transform World Bank API response to time series data
 */
export interface TimeSeriesDataPoint {
  year: number
  value: number | null
  originalValue: number | null
}

export interface TimeSeriesData {
  indicator: string
  label: string
  data: TimeSeriesDataPoint[]
  color: string
}

/**
 * Convert World Bank indicator values to time series format
 */
export function toTimeSeries(
  data: WorldBankIndicatorValue[] | undefined,
  label: string,
  color: string
): TimeSeriesData {
  if (!data) {
    return { indicator: '', label, data: [], color }
  }

  // Sort by year and convert to time series points
  const points: TimeSeriesDataPoint[] = data
    .filter(item => item.date && item.value !== null)
    .sort((a, b) => parseInt(a.date) - parseInt(b.date))
    .map(item => ({
      year: parseInt(item.date),
      value: item.value,
      originalValue: item.value,
    }))

  return {
    indicator: data[0]?.indicator?.id || '',
    label,
    data: points,
    color,
  }
}

/**
 * Normalize multiple time series together
 * Ensures all series are on the same scale for comparison
 */
export function normalizeTimeSeries(
  series: TimeSeriesData[],
  method: 'minmax' | 'zscore' = 'minmax'
): TimeSeriesData[] {
  return series.map(s => {
    const values = s.data
      .filter(d => d.value !== null)
      .map(d => d.value as number)

    if (values.length === 0) return s

    const normalized = method === 'minmax' 
      ? normalizeMinMax(values) 
      : normalizeZScore(values)

    let normalizedIndex = 0
    const normalizedData = s.data.map(d => ({
      ...d,
      value: d.value !== null ? normalized[normalizedIndex++] : null,
    }))

    return {
      ...s,
      data: normalizedData,
    }
  })
}

/**
 * Fill gaps in time series data with null values
 * Ensures all series have data points for the same years
 */
export function fillTimeSeriesGaps(
  series: TimeSeriesData[],
  startYear: number,
  endYear: number
): TimeSeriesData[] {
  return series.map(s => {
    const dataMap = new Map(s.data.map(d => [d.year, d]))
    const filledData: TimeSeriesDataPoint[] = []

    for (let year = startYear; year <= endYear; year++) {
      filledData.push(
        dataMap.get(year) || {
          year,
          value: null,
          originalValue: null,
        }
      )
    }

    return {
      ...s,
      data: filledData,
    }
  })
}

/**
 * Get the common year range across multiple time series
 */
export function getYearRange(series: TimeSeriesData[]): [number, number] {
  let minYear = Infinity
  let maxYear = -Infinity

  series.forEach(s => {
    s.data.forEach(d => {
      if (d.year < minYear) minYear = d.year
      if (d.year > maxYear) maxYear = d.year
    })
  })

  return [minYear === Infinity ? 1990 : minYear, maxYear === -Infinity ? 2020 : maxYear]
}