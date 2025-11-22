import { Feature, FeatureCollection, Geometry } from 'geojson'

export interface CountryProperties {
  name: string
  id: string
  renewableEnergy?: number
  gdpPerCapita?: number
  co2PerCapita?: number
}

export type CountryFeature = Feature<Geometry, CountryProperties>

export interface CountryFeatureCollection extends FeatureCollection<Geometry, CountryProperties> {
  features: CountryFeature[]
}

export interface MapDimensions {
  width: number
  height: number
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface TooltipData {
  country: string
  renewableEnergy?: number
  gdpPerCapita?: number
  co2PerCapita?: number
  x: number
  y: number
}