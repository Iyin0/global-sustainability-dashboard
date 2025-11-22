# 🌍 Global Sustainability Dashboard

A comprehensive, interactive web application for exploring global sustainability data, environmental indicators, and climate patterns across countries worldwide. Built with React, TypeScript, D3.js, and modern web technologies.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![D3.js](https://img.shields.io/badge/D3.js-7-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Visualizations](#visualizations)
- [Data Sources](#data-sources)
- [Technical Decisions & Tradeoffs](#technical-decisions--tradeoffs)
- [Key Implementation Details](#key-implementation-details)
- [Performance Optimizations](#performance-optimizations)
- [Future Enhancements](#future-enhancements)

---

## 🌟 Overview

The Global Sustainability Dashboard is a single-page application (SPA) that provides interactive visualizations of environmental and economic data from around the world. Users can explore country-specific sustainability metrics, compare nations across multiple dimensions, and analyze historical weather patterns.

**Key Objectives:**

- Make global sustainability data accessible and understandable
- Provide multiple visualization perspectives (map, charts, comparisons)
- Enable data-driven insights through interactive exploration
- Support both high-level overviews and detailed country analysis

---

## ✨ Features

### 🗺️ 1. Interactive World Map (Choropleth)

- **Purpose:** Global overview of renewable energy consumption by country
- **Interactions:**
  - Click any country to view detailed analytics
  - Hover for country name and renewable energy percentage
  - Color-coded from light (low renewable %) to dark (high renewable %)
- **Technology:** D3.js GeoJSON rendering with TopoJSON optimization
- **Data Source:** World Bank API (`EG.FEC.RNEW.ZS` indicator)
- **Development Notes:**
  - Researched and studied World Bank API endpoint documentation for optimal data fetching
  - Implemented best practices for API parameter formatting (date ranges, pagination)
  - Used `startYear:endYear` format for date range queries for better performance
- **Route:** `/`

### 📊 2. Country Detail Page

- **Multi-Series Line Chart**
  - Compare GDP per capita and Renewable Energy % over time
  - ⚠️ **Note:** CO₂ emissions temporarily unavailable due to World Bank API issue
  - Customizable year range (1990-2022)
  - Two normalization methods: Min-Max and Z-Score
  - Interactive hover tooltips with original values
  - Toggle legend to show/hide indicators
- **Stacked Area Chart**
  - Visualize energy mix (renewable vs non-renewable)
  - Areas always sum to 100%
  - Smooth curves with hover tooltips
  - Four insight cards: Current, Initial, Change, Average
- **Statistics Cards**
  - Dynamic calculation of key metrics
  - Color-coded for visual distinction
- **Route:** `/country/:code`

### 🎯 3. Country Comparison (Bubble Chart)

⚠️ **Note:** This feature is currently affected by the World Bank CO₂ data unavailability. The bubble chart may show incomplete or no data until an alternative CO₂ data source is integrated.

- **4-Dimensional Visualization:**
  - X-axis: GDP per Capita (logarithmic scale)
  - Y-axis: CO₂ Emissions per Capita (logarithmic scale) - **Currently unavailable**
  - Bubble size: Population (square root scale)
  - Bubble color: Geographic region (Africa, Americas, Asia, Europe, Oceania)
- **Advanced Filtering:**
  - Multi-select regions with checkboxes
  - Country search and multi-select (with search functionality)
  - Year selector (1990-2022)
  - Clear filters button
- **Interactions:**
  - Hover for detailed tooltip
  - Click bubble to navigate to country detail page
  - Statistics showing filtered vs total countries
- **Current Status:** Chart may not display properly due to missing CO₂ data from World Bank API (see Known Issues section below)
- **Route:** `/compare`

### 🌤️ 4. Weather Data Visualization

- **Temperature Line Chart**
  - Daily max/min temperatures for past 12 months
  - Dual lines (red for max, blue for min)
  - Shaded area showing temperature range
  - Interactive hover with focus circles
  - Date-specific tooltips
- **Calendar Heatmap**
  - Daily precipitation for past 12 months
  - Calendar grid layout (7 rows × ~52 columns)
  - Blue gradient color scale (darker = more rain)
  - Day/week/month labels
  - Hover tooltips with rain intensity descriptions
- **Statistics Cards**
  - Max/Min/Average temperatures
  - Total and average precipitation
  - Rainy days count
- **Route:** `/country/:code/weather`

### ℹ️ 5. About Page

- Comprehensive documentation of all features
- Visualization type explanations
- Data source information with external links
- Technology stack overview
- Quick navigation to main features
- **Route:** `/about`

---

## 🛠️ Technology Stack

### Frontend Framework

- **React 18** - Component-based UI library
- **TypeScript 5.0** - Type-safe development
- **Vite** - Fast build tool and dev server

### Routing & State Management

- **TanStack Router** - Type-safe file-based routing
- **TanStack Query (React Query)** - Server state management with caching
- **React Context API** - Centralized global state management
  - `AppContext` - Shared application state (year selection, filters, comparisons)
  - `ThemeContext` - Dark mode and theme preferences

### Styling

- **Tailwind CSS v4.0** - Utility-first CSS framework
- **CSS-first configuration** with `@theme` directive
- **Dark mode** support throughout

### Data Visualization

- **D3.js v7** - Data-driven visualizations
  - GeoJSON/TopoJSON for maps
  - Scales, axes, and generators for charts
  - Interactive SVG rendering

### Icons

- **Lucide React** - Modern, customizable icon library

### Package Manager

- **pnpm** - Fast, disk space efficient package manager

---

## 📁 Project Structure

```
global-sustainability-dashboard/
├── public/
│   ├── data/
│   │   └── countries-110m.json          # TopoJSON world map data
│   └── images/
│       ├── co2-indicator-error.png       # API error screenshot
│       └── bubble-chart-no-data.png      # Bubble chart issue screenshot
│
├── src/
│   ├── api/
│   │   ├── weatherData.ts                # Weather API integration
│   │   └── worldBank.ts                  # World Bank API integration
│   │
│   ├── assets/
│   │   └── react.svg                     # React logo
│   │
│   ├── components/
│   │   ├── Loading.tsx                   # Loading spinner component
│   │   ├── Navigation.tsx                # Main navigation menu
│   │   ├── NormalizationToggle.tsx       # Normalization method toggle
│   │   └── YearRangeSelector.tsx         # Year range control
│   │
│   ├── context/
│   │   ├── AppContext.tsx                # Centralized app state (year, filters, comparisons)
│   │   └── ThemeContext.tsx              # Dark mode theme state
│   │
│   ├── features/
│   │   ├── Bubblechart.tsx               # Multi-dimensional comparison chart
│   │   ├── Calendarheatmap.tsx           # Precipitation calendar
│   │   ├── ChoropethMap.tsx              # World map visualization
│   │   ├── MapLegend.tsx                 # Map color legend
│   │   ├── Multiserieslinechart.tsx      # Normalized trend comparison
│   │   ├── Stackedareachart.tsx          # Energy composition chart
│   │   └── Temperaturelinechart.tsx      # Temperature trends chart
│   │
│   ├── hooks/
│   │   ├── useWeatherData.ts             # Weather data fetching hook
│   │   └── useWorldBankData.ts           # World Bank data fetching hook
│   │
│   ├── lib/
│   │   ├── chartUtils.ts                 # Chart utility functions
│   │   ├── mapUtil.ts                    # Map utility functions
│   │   └── utils.ts                      # General utilities
│   │
│   ├── routes/
│   │   ├── __root.tsx                    # Root layout
│   │   ├── index.tsx                     # Home page (world map)
│   │   ├── about.tsx                     # About page
│   │   ├── compare.tsx                   # Bubble chart comparison page
│   │   └── country/
│   │       ├── $code/
│   │       │   ├── index.tsx             # Country detail page
│   │       │   └── weather.tsx           # Weather data page
│   │
│   ├── types/
│   │   ├── index.ts                      # Main type definitions
│   │   ├── map.ts                        # Map-related types
│   │   └── weather.ts                    # Weather-related types
│   │
│   ├── App.tsx                           # Main App component
│   ├── index.css                         # Global styles with Tailwind
│   ├── main.tsx                          # Application entry point
│   └── routeTree.gen.ts                  # Auto-generated route tree
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── pnpm-lock.yaml
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 🔄 State Management Architecture

The application uses a **centralized state management** approach through React Context API to provide a seamless user experience across different pages.

### AppContext - Global Application State

All shared state is managed through `AppContext`, which persists user selections across navigation:

**Managed State:**

- **`selectedYear`** (number) - Currently selected year for single-year visualizations
  - Used by: Home page (world map), Compare page (bubble chart)
  - Default: `2020`
- **`selectedYearRange`** ({ start: number, end: number }) - Year range for time-series visualizations
  - Used by: Country detail page (multi-series chart, stacked area chart)
  - Default: `{ start: 2010, end: 2020 }`
- **`selectedRegions`** (string[]) - Active region filters
  - Used by: Compare page for filtering countries by geographic region
  - Default: `[]` (all regions shown)
- **`compareCountries`** (string[]) - Selected countries for comparison
  - Used by: Compare page for highlighting specific countries
  - Default: `[]` (all countries shown)

**Key Benefits:**

- ✅ **State Persistence:** User selections persist when navigating between pages
- ✅ **Single Source of Truth:** No duplicate state management across components
- ✅ **Better UX:** Users don't need to reconfigure filters when switching views
- ✅ **Type Safety:** Full TypeScript support with defined interfaces

**Usage Example:**

```typescript
// In any component
import { useApp } from "@/contexts/AppContext";

function MyComponent() {
  const {
    selectedYear,
    setSelectedYear,
    selectedYearRange,
    setSelectedYearRange,
  } = useApp();

  // Use and update global state
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };
}
```

---

### Key Directories

**`/public`** - Static assets

- `data/` - GeoJSON/TopoJSON map data
- `images/` - Screenshots and image assets

**`/src/api`** - API integration modules

- Weather data fetching
- World Bank API calls

**`/src/components`** - Reusable UI components

- Navigation, loading states
- Form controls (year selector, toggles)

**`/src/features`** - Chart/visualization components

- All D3.js visualizations
- Map components

**`/src/hooks`** - Custom React hooks

- Data fetching with TanStack Query
- API integration hooks

**`/src/lib`** - Utility functions

- Chart calculations and transformations
- Map utilities
- General helpers

**`/src/routes`** - Page routes (TanStack Router)

- File-based routing structure
- Nested routes for country pages

**`/src/types`** - TypeScript type definitions

- Organized by feature/domain

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/global-sustainability-dashboard.git
cd global-sustainability-dashboard

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Environment Setup

No environment variables or API keys required! All APIs used are free and open:

- World Bank API - No authentication needed
- REST Countries API - No authentication needed
- Open-Meteo API - No authentication needed

---

## 📊 Visualizations

### 1. Choropleth Map

**Implementation:** D3.js with GeoJSON

```typescript
// Key technical details:
- Projection: Natural Earth (d3.geoNaturalEarth1)
- Data format: TopoJSON for smaller file size
- Color scale: Sequential (light to dark blue)
- Interaction: Click events with TanStack Router navigation
```

### 2. Multi-Series Line Chart

**Implementation:** D3.js with dual normalization

```typescript
// Normalization methods:
1. Min-Max: (value - min) / (max - min)
   - Scales all values to [0, 1]
   - Good for visual comparison

2. Z-Score: (value - mean) / stdDev
   - Shows standard deviations from mean
   - Better for statistical analysis
```

### 3. Stacked Area Chart

**Implementation:** D3.js stack generator

```typescript
// Key features:
- Automatic complementary calculation: nonRenewable = 100 - renewable
- D3 stack generator ensures perfect stacking
- Smooth curves with d3.curveMonotoneX
- Always sums to 100% for intuitive understanding
```

### 4. Bubble Chart

**Implementation:** Multi-scale D3.js visualization

```typescript
// Scale choices:
- X/Y axes: Logarithmic (handles extreme ranges)
- Bubble size: Square root (perceptually accurate area encoding)
- Color: Categorical (5 regions with distinct colors)

// Why log scales?
- GDP ranges from $100 to $100,000+
- CO₂ ranges from 0.01 to 100+ tonnes
- Linear scales would compress most countries
```

### 5. Temperature Line Chart

**Implementation:** D3.js with area fill

```typescript
// Design decisions:
- Dual lines (max/min) with shaded area between
- Red (max) and Blue (min) for intuitive interpretation
- Focus circles on hover for precise reading
- Smooth curves for better visual flow
```

### 6. Calendar Heatmap

**Implementation:** D3.js grid layout

```typescript
// Layout calculation:
- Cell size: chartHeight / 7 days
- Ensures proper square cells (not rectangles)
- Week-based columns (~52 weeks)
- Color: Sequential blue scale
```

---

## 🗄️ Data Sources

### 1. World Bank API

**Base URL:** `https://api.worldbank.org/v2/`

**Indicators Used:**

- `NY.GDP.PCAP.CD` - GDP per capita (current US$)
- `EG.FEC.RNEW.ZS` - Renewable energy consumption (% of total)
- `EN.ATM.CO2E.PC` - CO₂ emissions per capita (metric tonnes)

**Features:**

- Historical data from 1960-present
- 217 countries and territories
- JSON format responses
- No authentication required

**API Documentation Research:**

During the development of the interactive world map and data visualizations, extensive research was conducted on the World Bank API endpoint documentation to ensure optimal data fetching and proper implementation:

- 📚 **Documentation Study:** Thoroughly reviewed the official [World Bank API documentation](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation) to understand:
  - Query parameter structures and formatting
  - Date range query formats (`startYear:endYear` vs single year)
  - Pagination handling (`per_page` parameter for bulk requests)
  - Response format structures (metadata array + data array pattern)
  - Error handling and status codes
- 🔧 **Implementation Best Practices:**
  - Used `date=YYYY:YYYY` format for year range queries (more efficient than multiple requests)
  - Implemented `per_page=300` for comprehensive country data
  - Properly handled the two-element response array `[metadata, data]`
  - Added error handling for indicator availability issues
- 🎯 **Optimization Insights:**
  - Single-year queries: `date=2020` for snapshot comparisons
  - Multi-year ranges: `date=1990:2020` for time-series analysis
  - Country-specific queries vs global queries (`country/all/indicator/`)
  - Understanding data freshness and update cycles

**Challenges & Solutions:**

- ⚠️ **Challenge:** Some countries have sparse data
- ✅ **Solution:** Filter null values, show data availability indicators
- ⚠️ **Challenge:** API can be slow with large date ranges
- ✅ **Solution:** Implement TanStack Query caching with 1-hour stale time
- ⚠️ **Critical Issue:** CO₂ emissions indicator (`EN.ATM.CO2E.PC`) unavailable for broad date ranges
- 🔴 **Status:** API returns error for queries like `date=1990:2022`: "The indicator was not found. It may have been deleted or archived."
- ✅ **Partial Workaround:** Single-year queries (e.g., `date=2020`) still work for the bubble chart comparison
- 📸 **Evidence:** See `/public/images/co2-indicator-error.png` for API error response
- 🔧 **Implementation:**
  - Multi-series line chart: CO₂ indicator disabled (shows GDP + Renewable Energy only)
  - Bubble chart: Uses single-year queries, works for specific years like 2020
  - See `/public/images/bubble-chart-working.png` for functional bubble chart with CO₂ data
- 🔄 **Future:** Consider alternative CO₂ data sources (Our World in Data, Carbon Monitor) for consistent multi-year data

### 2. REST Countries API

**Base URL:** `https://restcountries.com/v3.1/`

**Data Retrieved:**

- Country names (common and official)
- ISO codes (Alpha-2, Alpha-3)
- Population figures
- Geographic coordinates (latitude/longitude)
- Regional classifications

**Features:**

- Comprehensive country metadata
- Fast response times
- No rate limiting for reasonable use
- Well-maintained and reliable

### 3. Open-Meteo Archive API

**Base URL:** `https://archive-api.open-meteo.com/v1/archive`

**Data Retrieved:**

- Daily maximum temperature (2m above ground)
- Daily minimum temperature (2m above ground)
- Daily precipitation sum (mm)

**Features:**

- Historical weather data (past 12 months)
- Global coverage
- Free, no API key required
- Fast and reliable
- Timezone-aware responses

**Limitations:**

- Archive data only (not real-time forecasts)
- Weather data for capital cities (using coordinates)
- 12-month historical limit for free tier

---

## 🎯 Technical Decisions & Tradeoffs

### 1. SPA vs SSR

**Decision:** Single Page Application (SPA)

**Rationale:**

- ✅ Rich client-side interactions
- ✅ Smooth navigation without page reloads
- ✅ Better for data visualization (D3.js state management)
- ✅ Simpler deployment (static hosting)
- ❌ Initial bundle size slightly larger
- ❌ SEO requires additional configuration

**Tradeoff:** Accepted larger initial bundle for better UX and simpler architecture.

### 2. TanStack Router vs React Router

**Decision:** TanStack Router

**Rationale:**

- ✅ File-based routing (cleaner structure)
- ✅ Type-safe routes and params
- ✅ Built-in search params handling
- ✅ Better TypeScript integration
- ❌ Smaller community than React Router
- ❌ Learning curve for new syntax

**Tradeoff:** Smaller community acceptable due to superior TypeScript experience.

### 3. Client-Side API Calls vs Backend Proxy

**Decision:** Direct client-side calls

**Rationale:**

- ✅ Simpler architecture (no backend needed)
- ✅ Free APIs with no authentication
- ✅ Lower hosting costs (static site)
- ✅ Easier to deploy and maintain
- ❌ Cannot hide API keys (not needed here)
- ❌ Cannot implement rate limiting
- ❌ CORS must be supported by APIs

**Tradeoff:** Accepted CORS dependency since all APIs support it.

### 4. Centralized State Management with React Context

**Decision:** Use React Context API for global state instead of local component state

**Rationale:**

- ✅ **State persistence across navigation** - User selections maintained when moving between pages
- ✅ **Single source of truth** - No duplicate state management in different components
- ✅ **Better user experience** - Filters and year selections don't reset on navigation
- ✅ **Type safety** - Full TypeScript support with defined interfaces
- ✅ **Simple implementation** - No additional dependencies (Redux, Zustand, etc.)
- ✅ **Performance** - Minimal re-renders with properly structured context
- ❌ **Slightly more boilerplate** - Need to wrap app in providers
- ❌ **Context limitations** - Not suitable for very complex state (acceptable for this use case)

**Implementation Details:**

- `AppContext` manages: year selection, year ranges, region filters, country comparisons
- `ThemeContext` manages: dark mode preferences
- Custom hooks (`useApp()`, `useTheme()`) provide easy access
- State persists when users navigate from home → compare → country detail and back

**Tradeoff:** Small increase in setup complexity for significant UX improvement and code maintainability.

### 5. D3.js vs Chart Libraries

**Decision:** D3.js

**Rationale:**

- ✅ Maximum flexibility and customization
- ✅ Fine-grained control over interactions
- ✅ Better for complex multi-dimensional visualizations
- ✅ Industry standard for data visualization
- ❌ Steeper learning curve
- ❌ More code to write
- ❌ Need to handle responsive behavior manually

**Tradeoff:** More development time for superior customization and performance.

### 6. Logarithmic Scales in Bubble Chart

**Decision:** Log scales for GDP and CO₂ axes

**Rationale:**

- ✅ Handles extreme value ranges (GDP: $100-$100,000+)
- ✅ Makes patterns visible across all development levels
- ✅ Prevents compression of low-income countries
- ❌ Less intuitive for general users
- ❌ Distances not proportional to actual differences

**Tradeoff:** Better data visibility outweighs intuition loss; added labels to help interpretation.

### 6. Square Root Scale for Bubble Size

**Decision:** Square root scale for population

**Rationale:**

- ✅ Perceptually accurate (humans perceive area, not radius)
- ✅ Prevents large populations from dominating
- ✅ Standard practice in bubble charts
- ❌ Not immediately obvious to users

**Tradeoff:** Added population legend with size reference circles for clarity.

### 7. Normalization in Multi-Series Chart

**Decision:** Offer both Min-Max and Z-Score

**Rationale:**

- ✅ Min-Max better for visual comparison (0-1 range)
- ✅ Z-Score better for statistical analysis
- ✅ Gives users flexibility
- ❌ May confuse non-technical users
- ❌ More complex to implement

**Tradeoff:** Added explanatory tooltip; educational opportunity for users.

### 8. Stacked Area vs Separate Lines

**Decision:** Stacked area for energy composition

**Rationale:**

- ✅ Shows composition (part-of-whole relationship)
- ✅ Always sums to 100% (intuitive)
- ✅ Visual emphasis on renewable vs non-renewable
- ❌ Can't show multiple countries simultaneously
- ❌ Less precise than line chart for exact values

**Tradeoff:** Composition view more important than multi-country comparison in this context.

### 10. Calendar Heatmap Layout

**Decision:** GitHub-style calendar grid

**Rationale:**

- ✅ Familiar pattern (GitHub contributions)
- ✅ Shows weekly and seasonal patterns
- ✅ Compact representation of 365 days
- ❌ Can be cluttered on small screens
- ❌ Requires horizontal scrolling on mobile

**Tradeoff:** Added overflow-x-auto and min-width for mobile; desktop experience prioritized.

### 11. Caching Strategy

**Decision:** TanStack Query with 1-hour stale time

**Rationale:**

- ✅ Reduces API calls (data doesn't change frequently)
- ✅ Faster navigation (cached data)
- ✅ Better user experience
- ❌ May show slightly outdated data
- ❌ Uses browser memory

**Tradeoff:** Acceptable staleness for data that updates annually.

### 12. TypeScript Strict Mode

**Decision:** Enabled strict mode

**Rationale:**

- ✅ Catches errors at compile time
- ✅ Better IDE support and autocomplete
- ✅ Self-documenting code
- ❌ More verbose type definitions
- ❌ Slower initial development

**Tradeoff:** Long-term maintainability over short-term speed.

### 13. Tailwind CSS v4

**Decision:** Use Tailwind CSS v4 with CSS-first config

**Rationale:**

- ✅ Modern approach with `@theme` directive
- ✅ Better performance (no PostCSS config needed)
- ✅ Cleaner configuration
- ❌ Latest version (potential breaking changes)
- ❌ Less documentation/examples available

**Tradeoff:** Cutting-edge features worth potential instability; project is greenfield.

### 14. No Backend/Database

**Decision:** Fully client-side application

**Rationale:**

- ✅ No server costs
- ✅ Easy to deploy (static hosting)
- ✅ Fast for users (no server round trips)
- ✅ Simpler architecture
- ❌ Cannot persist user preferences
- ❌ Cannot implement custom analytics
- ❌ Limited to public APIs

**Tradeoff:** Acceptable for MVP; can add backend later if needed.

### 15. Dynamic Y-Axis Scaling

**Decision:** Adjust bubble chart axes based on filtered data

**Rationale:**

- ✅ Better use of chart space
- ✅ Clearer visualization when filtering
- ✅ Prevents empty space with compressed data
- ❌ Scale changes when filters applied
- ❌ May confuse users comparing filtered/unfiltered views

**Tradeoff:** Better visual clarity outweighs potential confusion; scale labels provide context.

---

## 🔑 Key Implementation Details

### Data Fetching Pattern

```typescript
// Custom hook pattern with TanStack Query
export function useWorldBankData(countryCode: string, indicator: string) {
  return useQuery({
    queryKey: ["worldbank", countryCode, indicator],
    queryFn: () => fetchData(countryCode, indicator),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!countryCode, // Only fetch when country is selected
  });
}
```

### Dynamic Scale Adjustment

```typescript
// Bubble chart Y-axis adjusts to actual data range
const co2Values = filteredData.map((d) => d.co2PerCapita);
const minCO2 = Math.max(0.01, d3.min(co2Values) || 0.01);
const maxCO2 = d3.max(co2Values) || 100;

const yScale = d3
  .scaleLog()
  .domain([minCO2, maxCO2 * 1.2]) // 20% padding for visual clarity
  .range([chartHeight, 0])
  .nice();
```

### Calendar Cell Sizing

```typescript
// Ensures proper square cells using available height
const cellSize = Math.floor((chartHeight - cellPadding * 6) / 7);
// Divides height equally among 7 days of the week
```

### ISO Code Conversion

```typescript
// World Bank uses ISO3, REST Countries uses ISO2
export function convertISO2toISO3(iso2: string): string {
  const mapping = { US: "USA", GB: "GBR" /* ... */ };
  return mapping[iso2] || iso2;
}
```

---

## ⚡ Performance Optimizations

### 1. Data Memoization

```typescript
const chartData = useMemo(() => processData(rawData), [rawData]);
```

### 2. Component Code Splitting

TanStack Router automatically code-splits routes

### 3. SVG Optimization

```typescript
// Clear old elements before re-rendering
d3.select(svgRef.current).selectAll("*").remove();
```

### 4. API Request Deduplication

TanStack Query deduplicates simultaneous requests

### 5. TopoJSON Usage

~80% smaller than equivalent GeoJSON

---

## 🐛 Known Issues & Limitations

### Data Availability

- **CO₂ emissions indicator currently unavailable from World Bank API** ⚠️
  - Indicator `EN.ATM.CO2E.PC` returns error: "The indicator was not found. It may have been deleted or archived."
  - **Screenshots:**
    - API error response: `/public/images/co2-indicator-error.png`
    - Bubble chart impact: `/public/images/bubble-chart-no-data.png`
  - **Impact on Features:**
    1. **Multi-Series Line Chart (Country Detail)** - Now shows only GDP per capita and Renewable Energy %; CO₂ line removed
    2. **Bubble Chart (Compare Page)** - **Severely affected:** Chart displays with all bubbles clustered at the top (Y-axis shows CO₂ data but values are missing), making the 4-dimensional comparison impossible
  - **Root Cause:** World Bank API returns error for the indicator across all date ranges (tested 1990:2022, 2020, etc.)
  - **Workaround:** CO₂ indicator temporarily disabled in multi-series chart; bubble chart remains visible but non-functional for its intended purpose
  - **Alternative sources being evaluated:**
    - Our World in Data API (GitHub: owid/co2-data)
    - Carbon Monitor (near real-time data)
    - EDGAR database (EU Joint Research Centre)
  - **Recommended Action:** Integrate alternative CO₂ data source to restore full functionality, especially for the bubble chart which is central to the comparison feature
- Some countries have incomplete World Bank data (especially for older years)
- Weather data only available for capital cities (not entire country)

### Performance

- Initial load of world map can take 2-3 seconds on slow connections
- Bubble chart with 200+ countries can be laggy on older devices
- Calendar heatmap requires horizontal scroll on mobile devices

### Browser Compatibility

- Optimized for modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- IE11 not supported (uses modern JavaScript features)
- Some CSS features require recent browser versions

### API Limitations

- World Bank API occasionally returns errors (retry logic implemented)
- Open-Meteo historical data limited to 12 months (free tier)
- No real-time data (all data is historical)

---

## 🚧 Future Enhancements

### High Priority

- [ ] User preferences persistence (localStorage)
- [ ] Country favorites/bookmarks
- [ ] Export charts as PNG/SVG
- [ ] Advanced filtering (income level, custom groups)
- [ ] Time series animation

### Medium Priority

- [ ] Additional indicators (forest cover, water usage)
- [ ] Regional aggregations
- [ ] Correlation analysis tools
- [ ] Historical year comparison
- [ ] Mobile app (React Native)

### Technical Debt

- [ ] Unit tests (Jest + RTL)
- [ ] E2E tests (Playwright)
- [ ] Error boundaries
- [ ] Loading skeletons
- [ ] Bundle size optimization

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- **World Bank** - Development indicators
- **REST Countries** - Country metadata
- **Open-Meteo** - Weather data
- **D3.js Community** - Visualization library
- **TanStack** - React libraries

---

**Built with ❤️ for a sustainable future**

_Last updated: November 2024_
