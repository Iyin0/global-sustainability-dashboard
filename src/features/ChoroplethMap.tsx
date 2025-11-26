import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import * as d3 from 'd3'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { loadWorldTopology, createColorScale, countryCodeMap, formatValue } from '@/lib/mapUtil'
import type { FeatureCollection } from 'geojson'
import type { CountryFeatureCollection, TooltipData } from '@/types/map'

interface WorldMapProps {
  data: Record<string, number> // countryCode -> renewable energy %
  width?: number
  height?: number
}

export default function ChoroplethMap({ 
  data, 
  width = 960, 
  height = 600,
}: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [countries, setCountries] = useState<CountryFeatureCollection | null>(null)
  const [dimensions, setDimensions] = useState({ width, height })
  const navigate = useNavigate()

  // Handle responsive sizing
  useEffect(() => {
    if (!containerRef.current) return

    const handleResize = () => {
      const containerWidth = containerRef.current?.clientWidth || width
      
      // On mobile, use a minimum width to prevent truncation
      const isMobile = window.innerWidth < 640
      const effectiveWidth = isMobile 
        ? Math.max(containerWidth, 500) // Minimum 500px width on mobile for better display
        : containerWidth
      
      setDimensions({
        width: effectiveWidth,
        height: isMobile ? 400 : height, // Slightly shorter on mobile
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

  // Load world topology
  useEffect(() => {
    loadWorldTopology().then(setCountries)
  }, [])

  // Render map
  useEffect(() => {
    if (!svgRef.current || !countries) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Clear previous render
    
    // Setup projection and path
    const projection = geoNaturalEarth1()
      .fitSize([dimensions.width, dimensions.height], countries as unknown as FeatureCollection)

    const path = geoPath().projection(projection)

    // Get min/max values for color scale
    const values = Object.values(data).filter(v => v !== undefined && !isNaN(v))
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)

    const colorScale = createColorScale([minValue, maxValue])

    // Create main group
    const g = svg.append('g')

    // Add countries
    g.selectAll('path')
      .data(countries.features)
      .join('path')
      .attr('d', path)
      .attr('class', 'country')
      .attr('fill', (d) => {
        const numericId = d.id as string
        const countryCode = countryCodeMap[numericId]
        const value = countryCode ? data[countryCode] : undefined
        return value !== undefined ? colorScale(value) : '#e0e0e0'
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        // Highlight country
        d3.select(this)
          .attr('stroke', '#000000')
          .attr('stroke-width', 2)
          .raise()

        // Show tooltip
        const numericId = d.id as string
        const countryCode = countryCodeMap[numericId]
        const value = countryCode ? data[countryCode] : undefined

        setTooltip({
          country: d.properties?.name || 'Unknown',
          renewableEnergy: value,
          x: event.clientX,
          y: event.clientY,
        })
      })
      .on('mousemove', function(event) {
        setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null)
      })
      .on('mouseout', function() {
        // Remove highlight
        d3.select(this)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 0.5)

        setTooltip(null)
      })
      .on('click', function(_, d) {
        const numericId = d.id as string
        const countryCode = countryCodeMap[numericId]
        if (countryCode) {
          navigate({ to: `/country/${countryCode.toLowerCase()}` })
        }
      })

  }, [countries, data, dimensions, navigate])

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Map container with horizontal scroll on mobile */}
      <div className="w-full overflow-x-auto overflow-y-visible">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="border border-gray-300 dark:border-gray-700 rounded-lg"
          style={{ display: 'block' }} // Prevents extra space below SVG
        />
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl px-3 py-2 pointer-events-none"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y + 10}px`,
          }}
        >
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {tooltip.country}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Renewable Energy Consumption: {formatValue(tooltip.renewableEnergy, 1)}%
          </div>
        </div>
      )}
    </div>
  )
}