import { feature } from 'topojson-client'
import { scaleQuantize } from 'd3-scale'
import { CountryFeatureCollection } from '@/types/map'
import type { Topology, GeometryCollection } from 'topojson-specification'

/**
 * Load and convert TopoJSON to GeoJSON
 */
export async function loadWorldTopology(): Promise<CountryFeatureCollection> {
  const response = await fetch('/data/countries-110m.json')
  const topology: Topology = await response.json()
  
  // Convert TopoJSON to GeoJSON
  const countries = feature(
    topology,
    topology.objects.countries as GeometryCollection
  ) as CountryFeatureCollection
  
  return countries
}

/**
 * Create color scale for renewable energy percentage
 */
export function createColorScale(domain: [number, number]) {
  return scaleQuantize<string>()
    .domain(domain)
    .range([
      '#fee5d9', // 0-10%
      '#fcbba1', // 10-20%
      '#fc9272', // 20-30%
      '#fb6a4a', // 30-40%
      '#ef3b2c', // 40-50%
      '#cb181d', // 50-60%
      '#99000d', // 60-70%
    ])
}

/**
 * Get country code mapping (ISO numeric to alpha-2)
 * This is a subset - expand as needed
 */
export const countryCodeMap: Record<string, string> = {
  '004': 'AF', // Afghanistan
  '008': 'AL', // Albania
  '012': 'DZ', // Algeria
  '016': 'AS', // American Samoa
  '020': 'AD', // Andorra
  '024': 'AO', // Angola
  '032': 'AR', // Argentina
  '036': 'AU', // Australia
  '040': 'AT', // Austria
  '050': 'BD', // Bangladesh
  '056': 'BE', // Belgium
  '064': 'BT', // Bhutan
  '068': 'BO', // Bolivia
  '070': 'BA', // Bosnia and Herzegovina
  '072': 'BW', // Botswana
  '076': 'BR', // Brazil
  '100': 'BG', // Bulgaria
  '104': 'MM', // Myanmar
  '108': 'BI', // Burundi
  '116': 'KH', // Cambodia
  '120': 'CM', // Cameroon
  '124': 'CA', // Canada
  '140': 'CF', // Central African Republic
  '148': 'TD', // Chad
  '152': 'CL', // Chile
  '156': 'CN', // China
  '170': 'CO', // Colombia
  '178': 'CG', // Congo
  '180': 'CD', // Democratic Republic of the Congo
  '188': 'CR', // Costa Rica
  '191': 'HR', // Croatia
  '192': 'CU', // Cuba
  '196': 'CY', // Cyprus
  '203': 'CZ', // Czech Republic
  '208': 'DK', // Denmark
  '214': 'DO', // Dominican Republic
  '218': 'EC', // Ecuador
  '818': 'EG', // Egypt
  '222': 'SV', // El Salvador
  '226': 'GQ', // Equatorial Guinea
  '231': 'ET', // Ethiopia
  '233': 'EE', // Estonia
  '246': 'FI', // Finland
  '250': 'FR', // France
  '266': 'GA', // Gabon
  '268': 'GE', // Georgia
  '276': 'DE', // Germany
  '288': 'GH', // Ghana
  '300': 'GR', // Greece
  '320': 'GT', // Guatemala
  '324': 'GN', // Guinea
  '332': 'HT', // Haiti
  '340': 'HN', // Honduras
  '348': 'HU', // Hungary
  '352': 'IS', // Iceland
  '356': 'IN', // India
  '360': 'ID', // Indonesia
  '364': 'IR', // Iran
  '368': 'IQ', // Iraq
  '372': 'IE', // Ireland
  '376': 'IL', // Israel
  '380': 'IT', // Italy
  '388': 'JM', // Jamaica
  '392': 'JP', // Japan
  '400': 'JO', // Jordan
  '398': 'KZ', // Kazakhstan
  '404': 'KE', // Kenya
  '410': 'KR', // South Korea
  '414': 'KW', // Kuwait
  '417': 'KG', // Kyrgyzstan
  '418': 'LA', // Laos
  '428': 'LV', // Latvia
  '422': 'LB', // Lebanon
  '426': 'LS', // Lesotho
  '430': 'LR', // Liberia
  '434': 'LY', // Libya
  '440': 'LT', // Lithuania
  '442': 'LU', // Luxembourg
  '450': 'MG', // Madagascar
  '454': 'MW', // Malawi
  '458': 'MY', // Malaysia
  '466': 'ML', // Mali
  '470': 'MT', // Malta
  '478': 'MR', // Mauritania
  '484': 'MX', // Mexico
  '498': 'MD', // Moldova
  '499': 'ME', // Montenegro
  '504': 'MA', // Morocco
  '508': 'MZ', // Mozambique
  '516': 'NA', // Namibia
  '524': 'NP', // Nepal
  '528': 'NL', // Netherlands
  '554': 'NZ', // New Zealand
  '558': 'NI', // Nicaragua
  '562': 'NE', // Niger
  '566': 'NG', // Nigeria
  '578': 'NO', // Norway
  '586': 'PK', // Pakistan
  '591': 'PA', // Panama
  '598': 'PG', // Papua New Guinea
  '600': 'PY', // Paraguay
  '604': 'PE', // Peru
  '608': 'PH', // Philippines
  '616': 'PL', // Poland
  '620': 'PT', // Portugal
  '630': 'PR', // Puerto Rico
  '642': 'RO', // Romania
  '643': 'RU', // Russia
  '646': 'RW', // Rwanda
  '682': 'SA', // Saudi Arabia
  '686': 'SN', // Senegal
  '688': 'RS', // Serbia
  '694': 'SL', // Sierra Leone
  '702': 'SG', // Singapore
  '703': 'SK', // Slovakia
  '704': 'VN', // Vietnam
  '705': 'SI', // Slovenia
  '706': 'SO', // Somalia
  '710': 'ZA', // South Africa
  '724': 'ES', // Spain
  '729': 'SD', // Sudan
  '740': 'SR', // Suriname
  '748': 'SZ', // Eswatini
  '752': 'SE', // Sweden
  '756': 'CH', // Switzerland
  '760': 'SY', // Syria
  '762': 'TJ', // Tajikistan
  '764': 'TH', // Thailand
  '768': 'TG', // Togo
  '780': 'TT', // Trinidad and Tobago
  '784': 'AE', // United Arab Emirates
  '788': 'TN', // Tunisia
  '792': 'TR', // Turkey
  '795': 'TM', // Turkmenistan
  '800': 'UG', // Uganda
  '804': 'UA', // Ukraine
  '826': 'GB', // United Kingdom
  '834': 'TZ', // Tanzania
  '840': 'US', // United States
  '854': 'BF', // Burkina Faso
  '858': 'UY', // Uruguay
  '860': 'UZ', // Uzbekistan
  '862': 'VE', // Venezuela
  '887': 'YE', // Yemen
  '894': 'ZM', // Zambia
  '716': 'ZW', // Zimbabwe
}

/**
 * Format number for display
 */
export function formatValue(value: number | undefined, decimals: number = 1): string {
  if (value === undefined) return 'N/A'
  return value.toFixed(decimals)
}