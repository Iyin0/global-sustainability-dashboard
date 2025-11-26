/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useNavigate } from '@tanstack/react-router'

export interface BubbleDataPoint {
  code: string
  name: string
  gdpPerCapita: number
  co2PerCapita: number
  population: number
  region: string
  cca2: string
}

interface BubbleChartProps {
  data: BubbleDataPoint[]
  selectedRegions: string[]
  selectedCountries: string[]
  width?: number
  height?: number
  onCountryClick?: (code: string) => void
}

export default function BubbleChart({
  data,
  selectedRegions,
  selectedCountries,
  width = 1000,
  height = 600,
  onCountryClick,
}: BubbleChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width, height })
  const [hoveredPoint, setHoveredPoint] = useState<BubbleDataPoint | null>(null)
  const navigate = useNavigate()

  // Handle responsive sizing
  useEffect(() => {
    if (!containerRef.current) return

    const handleResize = () => {
      const containerWidth = containerRef.current?.clientWidth || width
      setDimensions({
        width: containerWidth,
        height,
      })
    }

    // Set initial size
    handleResize()

    // Create ResizeObserver to watch container size changes
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(containerRef.current)

    // Fallback: also listen to window resize
    window.addEventListener('resize', handleResize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [width, height])

  // Region color scale
  const regionColors: Record<string, string> = {
    Africa: '#ef4444',
    Americas: '#3b82f6',
    Asia: '#10b981',
    Europe: '#f59e0b',
    Oceania: '#8b5cf6',
  }

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return

    // Filter data based on selections
    let filteredData = data

    // Filter by selected regions
    if (selectedRegions.length > 0) {
      filteredData = filteredData.filter(d => selectedRegions.includes(d.region))
    }

    // Filter by selected countries
    if (selectedCountries.length > 0) {
      filteredData = filteredData.filter(d => selectedCountries.includes(d.code))
    }

    if (filteredData.length === 0) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Responsive margins
    const isMobile = dimensions.width < 640
    const margin = {
      top: isMobile ? 50 : 40,
      right: isMobile ? 20 : 20,
      bottom: isMobile ? 70 : 60,
      left: isMobile ? 50 : 80,
    }
    
    const chartWidth = dimensions.width - margin.left - margin.right
    const chartHeight = dimensions.height - margin.top - margin.bottom

    // Prevent rendering if dimensions are too small
    if (chartWidth <= 0 || chartHeight <= 0) return

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create scales
    const xScale = d3
      .scaleLog()
      .domain([
        Math.max(100, d3.min(filteredData, d => d.gdpPerCapita) || 100),
        d3.max(filteredData, d => d.gdpPerCapita) || 100000,
      ])
      .range([0, chartWidth])
      .nice()

    const yScale = d3
      .scaleLog()
      .domain([
        Math.max(0.01, d3.min(filteredData, d => d.co2PerCapita) || 0.01),
        d3.max(filteredData, d => d.co2PerCapita) || 100,
      ])
      .range([chartHeight, 0])
      .nice()

    // Radius scale for population - smaller on mobile
    const radiusScale = d3
      .scaleSqrt()
      .domain([0, d3.max(filteredData, d => d.population) || 1000000000])
      .range(isMobile ? [2, 25] : [3, 40])

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(xScale.ticks())
      .join('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.1)
      .attr('class', 'stroke-gray-200 dark:stroke-gray-700')

    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yScale.ticks())
      .join('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.1)
      .attr('class', 'stroke-gray-200 dark:stroke-gray-700')

    // Responsive tick counts
    const getXTickCount = (width: number) => {
      if (width < 400) return 3
      if (width < 640) return 4
      if (width < 768) return 6
      return 8
    }

    const getYTickCount = (width: number) => {
      if (width < 640) return 5
      return 8
    }

    // Add X axis with responsive ticks
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(getXTickCount(chartWidth), d3.format(',.0f'))
      .tickSize(-chartHeight)

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .attr('class', 'text-gray-600 dark:text-gray-400')
      .selectAll('text')
      .attr('class', 'fill-gray-600 dark:fill-gray-400')
      .style('font-size', isMobile ? '10px' : '12px')

    // Add Y axis with responsive ticks
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(getYTickCount(chartWidth), d3.format(',.1f'))
      .tickSize(-chartWidth)

    g.append('g')
      .call(yAxis)
      .attr('class', 'text-gray-600 dark:text-gray-400')
      .selectAll('text')
      .attr('class', 'fill-gray-600 dark:fill-gray-400')
      .style('font-size', isMobile ? '10px' : '12px')

    // Add X axis label
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + (isMobile ? 45 : 50))
      .attr('text-anchor', 'middle')
      .attr('class', isMobile ? 'text-xs font-semibold fill-gray-700 dark:fill-gray-300' : 'text-sm font-semibold fill-gray-700 dark:fill-gray-300')
      .text(isMobile ? 'GDP per Capita (USD)' : 'GDP per Capita (USD, log scale)')

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chartHeight / 2)
      .attr('y', isMobile ? -35 : -60)
      .attr('text-anchor', 'middle')
      .attr('class', isMobile ? 'text-xs font-semibold fill-gray-700 dark:fill-gray-300' : 'text-sm font-semibold fill-gray-700 dark:fill-gray-300')
      .text(isMobile ? 'CO₂ per Capita (t)' : 'CO₂ Emissions per Capita (tonnes, log scale)')

    // Add title with responsive sizing
    const titleText = 'Country Comparison: GDP vs CO₂ Emissions'
    const shortTitle = 'GDP vs CO₂ Emissions'
    
    svg
      .append('text')
      .attr('x', dimensions.width / 2)
      .attr('y', isMobile ? 25 : 25)
      .attr('text-anchor', 'middle')
      .attr('class', isMobile ? 'text-base font-bold fill-gray-800 dark:fill-gray-200' : 'text-lg font-bold fill-gray-800 dark:fill-gray-200')
      .text(isMobile ? shortTitle : titleText)

    // Create bubbles
    const bubbles = g
      .selectAll('.bubble')
      .data(filteredData)
      .join('circle')
      .attr('class', 'bubble')
      .attr('cx', d => xScale(d.gdpPerCapita))
      .attr('cy', d => yScale(d.co2PerCapita))
      .attr('r', d => radiusScale(d.population))
      .attr('fill', d => regionColors[d.region] || '#6b7280')
      .attr('opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', isMobile ? 1 : 2)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.2s')

    // Add interactions
    bubbles
      .on('mouseover', function (event, d) {
        // Highlight bubble
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke-width', isMobile ? 2 : 3)
          .raise()

        setHoveredPoint(d)

        // Position tooltip using clientX/clientY for proper positioning when page is scrolled
        if (tooltipRef.current) {
          const tooltip = d3.select(tooltipRef.current)
          tooltip
            .style('opacity', 1)
            .style('left', `${event.clientX + 10}px`)
            .style('top', `${event.clientY - 10}px`)
        }
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 0.7).attr('stroke-width', isMobile ? 1 : 2)

        setHoveredPoint(null)

        if (tooltipRef.current) {
          d3.select(tooltipRef.current).style('opacity', 0)
        }
      })
      .on('click', function (event, d) {
        event.stopPropagation()
        if (onCountryClick) {
          onCountryClick(d.code)
        } else {
          navigate({ to: `/country/${d.cca2.toLowerCase()}` })
        }
      })

    // Style axis lines
    svg
      .selectAll('.domain')
      .attr('stroke', 'currentColor')
      .attr('class', 'stroke-gray-300 dark:stroke-gray-600')

    svg.selectAll('.tick line').attr('class', 'stroke-gray-200 dark:stroke-gray-700')
  }, [data, selectedRegions, selectedCountries, dimensions, navigate, onCountryClick])

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Chart - fully responsive without horizontal scroll */}
      <div className="w-full">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full" />
      </div>

      {/* Legend - moved to bottom */}
      <div className="mt-6 space-y-4">
        {/* Regions Legend */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
            Regions
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.entries(regionColors).map(([region, color]) => (
              <div
                key={region}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-white"
                  style={{ backgroundColor: color, opacity: 0.7 }}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {region}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Population Legend */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
            Population (Bubble Size)
          </h3>
          <div className="flex flex-wrap gap-4 justify-center items-center">
            {[10000000, 100000000, 1000000000].map((pop) => {
              const size = Math.sqrt(pop / 1000000000) * 40 // Approximate size
              return (
                <div key={pop} className="flex items-center gap-2">
                  <div
                    className="rounded-full border-2 border-gray-400 dark:border-gray-500"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      minWidth: `${size}px`,
                      minHeight: `${size}px`,
                    }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {d3.format('.2s')(pop)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed pointer-events-none opacity-0 transition-opacity bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 text-sm z-50 min-w-[200px]"
        style={{ opacity: hoveredPoint ? 1 : 0 }}
      >
        {hoveredPoint && (
          <>
            <div className="font-bold text-base mb-2 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              {hoveredPoint.name}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: regionColors[hoveredPoint.region] || '#6b7280' }}
                ></div>
                <span className="text-gray-600 dark:text-gray-400 text-xs">
                  {hoveredPoint.region}
                </span>
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">GDP per Capita:</span>{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  ${d3.format(',.0f')(hoveredPoint.gdpPerCapita)}
                </span>
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">CO₂ per Capita:</span>{' '}
                <span className="text-red-600 dark:text-red-400">
                  {d3.format(',.2f')(hoveredPoint.co2PerCapita)} tonnes
                </span>
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Population:</span>{' '}
                <span className="text-green-600 dark:text-green-400">
                  {d3.format(',.0f')(hoveredPoint.population)}
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 italic">
              Click to view details
            </div>
          </>
        )}
      </div>
    </div>
  )
}