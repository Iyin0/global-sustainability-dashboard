import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AppContextType {
  selectedYear: string
  setSelectedYear: React.Dispatch<React.SetStateAction<string>>
  selectedYearRange: { start: number; end: number }
  setSelectedYearRange: React.Dispatch<React.SetStateAction<{ start: number; end: number }>>
  selectedRegions: string[]
  setSelectedRegions: React.Dispatch<React.SetStateAction<string[]>>
  compareCountries: string[]
  setCompareCountries: React.Dispatch<React.SetStateAction<string[]>>
  normalizationMethod: 'minmax' | 'zscore'
  setNormalizationMethod: React.Dispatch<React.SetStateAction<'minmax' | 'zscore'>>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<string>("2020")
  const [selectedYearRange, setSelectedYearRange] = useState<{ start: number; end: number }>({
    start: 1990,
    end: 2020,
  })
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [compareCountries, setCompareCountries] = useState<string[]>([])
  const [normalizationMethod, setNormalizationMethod] = useState<'minmax' | 'zscore'>('minmax')

  return (
    <AppContext.Provider
      value={{
        selectedYear,
        setSelectedYear,
        selectedYearRange,
        setSelectedYearRange,
        selectedRegions,
        setSelectedRegions,
        compareCountries,
        setCompareCountries,
        normalizationMethod,
        setNormalizationMethod,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}