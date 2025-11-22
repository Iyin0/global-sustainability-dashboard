import { createFileRoute, Link } from '@tanstack/react-router'
import { 
  Globe, 
  TrendingUp, 
  BarChart3, 
  Cloud, 
  Map, 
  Database,
  Layers,
  Activity,
  CloudRain,
  ArrowRight,
  ExternalLink
} from 'lucide-react'

export const Route = createFileRoute('/about')({
  component: AboutComponent,
})

function AboutComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Global Sustainability Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          A comprehensive interactive platform for exploring global sustainability data, 
          environmental indicators, and climate patterns across countries worldwide.
        </p>
      </div>

      {/* Key Features Grid */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: Global Map */}
          <Link to="/" className="card hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Map className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Interactive World Map
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choropleth map visualization of renewable energy consumption by country. 
                  Click any country to explore detailed data.
                </p>
              </div>
            </div>
          </Link>

          {/* Feature 2: Country Details */}
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Country Analytics
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Multi-series line charts showing GDP per capita, renewable energy %, 
                  and CO₂ emissions with customizable year ranges and normalization.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3: Energy Composition */}
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Energy Mix Analysis
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stacked area charts showing renewable vs non-renewable energy composition 
                  over time, always summing to 100%.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 4: Country Comparison */}
          <Link to="/compare" className="card hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Bubble Chart Comparison
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Compare countries across 4 dimensions: GDP per capita, CO₂ emissions, 
                  population, and region. Filter by region or specific countries.
                </p>
              </div>
            </div>
          </Link>

          {/* Feature 5: Weather Data */}
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <CloudRain className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Weather Patterns
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Historical weather data with temperature line charts and precipitation 
                  calendar heatmaps for the past 12 months.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 6: Data Insights */}
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Activity className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Real-time Statistics
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dynamic calculation of key metrics: averages, trends, changes over time, 
                  and comparative statistics across indicators.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Visualization Types
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Choropleth Map */}
          <div className="card bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Choropleth World Map
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• <strong>Purpose:</strong> Global overview of renewable energy adoption</li>
              <li>• <strong>Interaction:</strong> Click countries for detailed analysis</li>
              <li>• <strong>Color scale:</strong> Light to dark indicating low to high renewable %</li>
              <li>• <strong>Features:</strong> Tooltips, zoom, pan, responsive design</li>
            </ul>
          </div>

          {/* Multi-Series Line Chart */}
          <div className="card bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              Multi-Series Line Chart
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• <strong>Purpose:</strong> Compare multiple indicators over time</li>
              <li>• <strong>Indicators:</strong> GDP, Renewable Energy %, CO₂ emissions</li>
              <li>• <strong>Normalization:</strong> Min-Max or Z-Score for fair comparison</li>
              <li>• <strong>Features:</strong> Year range selection, hover tooltips, legend toggle</li>
            </ul>
          </div>

          {/* Stacked Area Chart */}
          <div className="card bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Stacked Area Chart
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• <strong>Purpose:</strong> Show energy composition (renewable vs non-renewable)</li>
              <li>• <strong>Visualization:</strong> Two areas always summing to 100%</li>
              <li>• <strong>Colors:</strong> Green (renewable), Red (non-renewable)</li>
              <li>• <strong>Features:</strong> Smooth curves, interactive tooltips, insights cards</li>
            </ul>
          </div>

          {/* Bubble Chart */}
          <div className="card bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              Bubble Chart
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• <strong>Purpose:</strong> Multi-dimensional country comparison</li>
              <li>• <strong>Dimensions:</strong> X=GDP, Y=CO₂, Size=Population, Color=Region</li>
              <li>• <strong>Scales:</strong> Logarithmic for GDP and CO₂, square root for population</li>
              <li>• <strong>Features:</strong> Region/country filters, click navigation, year selector</li>
            </ul>
          </div>

          {/* Temperature Line Chart */}
          <div className="card bg-linear-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Cloud className="h-5 w-5 text-red-600 dark:text-red-400" />
              Temperature Line Chart
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• <strong>Purpose:</strong> Track daily temperature variations</li>
              <li>• <strong>Data:</strong> Max/min temperatures for past 12 months</li>
              <li>• <strong>Visualization:</strong> Dual lines with shaded range area</li>
              <li>• <strong>Features:</strong> Focus circles on hover, date-specific tooltips</li>
            </ul>
          </div>

          {/* Calendar Heatmap */}
          <div className="card bg-linear-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-cyan-200 dark:border-cyan-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Calendar Heatmap
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• <strong>Purpose:</strong> Visualize daily precipitation patterns</li>
              <li>• <strong>Layout:</strong> Calendar grid (7 rows × ~52 columns)</li>
              <li>• <strong>Color scale:</strong> Blue gradient (darker = more rain)</li>
              <li>• <strong>Features:</strong> Day/week/month labels, hover tooltips</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Data Sources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* World Bank */}
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                World Bank
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              World Development Indicators database providing comprehensive economic and environmental data.
            </p>
            <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
              <div>• GDP per Capita (NY.GDP.PCAP.CD)</div>
              <div>• Renewable Energy % (EG.FEC.RNEW.ZS)</div>
              <div>• CO₂ Emissions (EN.ATM.CO2E.PC)</div>
            </div>
            <a 
              href="https://data.worldbank.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mt-3"
            >
              Visit API Docs <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* REST Countries */}
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                REST Countries
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Comprehensive country information including geography, demographics, and metadata.
            </p>
            <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
              <div>• Country names and codes</div>
              <div>• Population data</div>
              <div>• Geographic coordinates</div>
              <div>• Regional classifications</div>
            </div>
            <a 
              href="https://restcountries.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400 hover:underline mt-3"
            >
              Visit API Docs <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Open-Meteo */}
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <Cloud className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Open-Meteo
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Free weather API providing historical climate data without requiring an API key.
            </p>
            <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
              <div>• Daily max/min temperatures</div>
              <div>• Precipitation data</div>
              <div>• Historical archive (12 months)</div>
              <div>• Capital city coordinates</div>
            </div>
            <a 
              href="https://open-meteo.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-cyan-600 dark:text-cyan-400 hover:underline mt-3"
            >
              Visit API Docs <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Technology Stack
        </h2>
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Frontend</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• React 18</li>
                <li>• TypeScript</li>
                <li>• Vite</li>
                <li>• Tailwind CSS v4</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Routing & State</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• TanStack Router</li>
                <li>• TanStack Query</li>
                <li>• React Context</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Visualization</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• D3.js v7</li>
                <li>• SVG rendering</li>
                <li>• Custom hooks</li>
                <li>• Interactive charts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Features</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Dark mode</li>
                <li>• Responsive design</li>
                <li>• TypeScript types</li>
                <li>• API caching</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Explore the Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            to="/" 
            className="card hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Global Overview
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Interactive world map showing renewable energy adoption by country
                </p>
              </div>
              <ArrowRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </Link>

          <Link 
            to="/compare" 
            className="card hover:shadow-xl transition-all border-2 border-transparent hover:border-orange-500 dark:hover:border-orange-400"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Compare Countries
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bubble chart comparing GDP, emissions, and population across nations
                </p>
              </div>
              <ArrowRight className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div className="card bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
          Project Purpose
        </h3>
        <p className="text-gray-700 dark:text-gray-300 text-center max-w-4xl mx-auto">
          This dashboard was built to provide accessible, interactive visualizations of global sustainability data. 
          By combining economic indicators, environmental metrics, and climate patterns, we aim to support 
          data-driven insights into the challenges and progress of sustainable development worldwide. 
          All data is sourced from reputable international organizations and updated regularly.
        </p>
      </div>
    </div>
  )
}