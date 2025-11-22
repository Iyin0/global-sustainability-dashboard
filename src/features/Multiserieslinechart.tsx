import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import type { TimeSeriesData } from '@/lib/chartUtils'

interface MultiSeriesLineChartProps {
  series: TimeSeriesData[]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  normalizationMethod?: 'minmax' | 'zscore'
}

export default function MultiSeriesLineChart({
  series,
  width = 800,
  height = 400,
  margin = { top: 20, right: 120, bottom: 50, left: 60 },
  normalizationMethod = 'minmax',
}: MultiSeriesLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width, height })
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(
    new Set(series.map(s => s.label))
  )
  const [tooltip, setTooltip] = useState<{
    year: number
    x: number
    y: number
    data: { label: string; value: number | null; originalValue: number | null; color: string }[]
  } | null>(null)

  // Handle responsive sizing
  useEffect(() => {
    if (!containerRef.current) return

    const handleResize = () => {
      const containerWidth = containerRef.current?.clientWidth || width
      setDimensions({
        width: containerWidth,
        height, // Keep height fixed or make it proportional if needed
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

  // Toggle series visibility
  const toggleSeries = (label: string) => {
    setVisibleSeries(prev => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      return next
    })
  }

  useEffect(() => {
    if (!svgRef.current || series.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const innerWidth = dimensions.width - margin.left - margin.right
    const innerHeight = dimensions.height - margin.top - margin.bottom

    // Prevent rendering if dimensions are too small
    if (innerWidth <= 0 || innerHeight <= 0) return

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Get all years from all series
    const allYears = Array.from(
      new Set(series.flatMap(s => s.data.map(d => d.year)))
    ).sort((a, b) => a - b)

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([Math.min(...allYears), Math.max(...allYears)])
      .range([0, innerWidth])

    // Get min/max values from visible series
    const visibleData = series
      .filter(s => visibleSeries.has(s.label))
      .flatMap(s => s.data.filter(d => d.value !== null).map(d => d.value as number))

    const yScale = d3
      .scaleLinear()
      .domain([
        visibleData.length > 0 ? Math.min(...visibleData) : 0,
        visibleData.length > 0 ? Math.max(...visibleData) : 1,
      ])
      .range([innerHeight, 0])
      .nice()

    // Create axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d => d.toString())
    const yAxis = d3.axisLeft(yScale)

    // Add X axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('class', 'fill-gray-600 dark:fill-gray-400')

    g.selectAll('.x-axis path, .x-axis line')
      .attr('class', 'stroke-gray-300 dark:stroke-gray-600')

    // Add Y axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .attr('class', 'fill-gray-600 dark:fill-gray-400')

    g.selectAll('.y-axis path, .y-axis line')
      .attr('class', 'stroke-gray-300 dark:stroke-gray-600')

    // Add X axis label
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('class', 'fill-gray-700 dark:fill-gray-300 text-sm')
      .text('Year')

    // Add Y axis label
    const yAxisLabel = normalizationMethod === 'minmax' 
      ? 'Normalized Value (Min-Max: 0-1)'
      : 'Normalized Value (Z-Score: σ)'
    
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('class', 'fill-gray-700 dark:fill-gray-300 text-sm')
      .text(yAxisLabel)

    // Create line generator
    const line = d3
      .line<{ year: number; value: number | null }>()
      .defined(d => d.value !== null)
      .x(d => xScale(d.year))
      .y(d => yScale(d.value as number))
      .curve(d3.curveMonotoneX)

    // Draw lines for each visible series
    series.forEach(s => {
      if (!visibleSeries.has(s.label)) return

      g.append('path')
        .datum(s.data)
        .attr('fill', 'none')
        .attr('stroke', s.color)
        .attr('stroke-width', 2)
        .attr('d', line)
        .attr('class', 'transition-opacity duration-300')

      // Add dots for data points
      // Sanitize label for CSS class (remove special characters)
      const sanitizedLabel = s.label.replace(/[^a-zA-Z0-9-]/g, '-')
      
      g.selectAll(`.dot-${sanitizedLabel}`)
        .data(s.data.filter(d => d.value !== null))
        .join('circle')
        .attr('cx', d => xScale(d.year))
        .attr('cy', d => yScale(d.value as number))
        .attr('r', 3)
        .attr('fill', s.color)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .attr('class', 'transition-opacity duration-300')
    })

    // Add interactive overlay for crosshair and tooltip
    const overlay = g
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')

    // Crosshair elements
    const crosshairLine = g
      .append('line')
      .attr('class', 'crosshair')
      .attr('stroke', '#666')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0)
      .attr('y1', 0)
      .attr('y2', innerHeight)

    // Handle mouse events
    overlay
      .on('mousemove', function (event) {
        const [mouseX] = d3.pointer(event)
        const year = Math.round(xScale.invert(mouseX))

        // Only show crosshair if year is in range
        if (year < allYears[0] || year > allYears[allYears.length - 1]) {
          crosshairLine.attr('opacity', 0)
          setTooltip(null)
          return
        }

        // Position crosshair
        const x = xScale(year)
        crosshairLine.attr('x1', x).attr('x2', x).attr('opacity', 0.5)

        // Collect data for tooltip
        const tooltipData = series
          .filter(s => visibleSeries.has(s.label))
          .map(s => {
            const dataPoint = s.data.find(d => d.year === year)
            return {
              label: s.label,
              value: dataPoint?.value || null,
              originalValue: dataPoint?.originalValue || null,
              color: s.color,
            }
          })

        // Get page coordinates for tooltip
        const svgRect = svgRef.current!.getBoundingClientRect()
        setTooltip({
          year,
          x: svgRect.left + margin.left + x,
          y: svgRect.top + margin.top,
          data: tooltipData,
        })
      })
      .on('mouseout', function () {
        crosshairLine.attr('opacity', 0)
        setTooltip(null)
      })
  }, [series, visibleSeries, dimensions, margin, normalizationMethod])

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Chart - now responsive with overflow handling */}
      <div className="w-full overflow-x-auto">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="border border-gray-300 dark:border-gray-700 rounded-lg min-w-full"
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {series.map(s => (
          <button
            key={s.label}
            onClick={() => toggleSeries(s.label)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
              ${
                visibleSeries.has(s.label)
                  ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 opacity-50'
              }
              hover:shadow-md`}
          >
            <div
              className="w-4 h-4 rounded"
              style={{
                backgroundColor: visibleSeries.has(s.label) ? s.color : '#999',
              }}
            />
            <span
              className={`text-sm font-medium ${
                visibleSeries.has(s.label)
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-500'
              }`}
            >
              {s.label}
            </span>
          </button>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                     rounded-lg shadow-xl px-3 py-2 pointer-events-none"
          style={{
            left: `${tooltip.x + 15}px`,
            top: `${tooltip.y}px`,
          }}
        >
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Year: {tooltip.year}
          </div>
          <div className="space-y-1">
            {tooltip.data.map(d => (
              <div key={d.label} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-gray-700 dark:text-gray-300 min-w-[140px]">
                  {d.label}:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {d.originalValue !== null
                    ? d.originalValue.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })
                    : 'N/A'}
                </span>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            Click legend to toggle series
          </div>
        </div>
      )}
    </div>
  )
}