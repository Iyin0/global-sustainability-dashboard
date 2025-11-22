/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface PrecipitationDataPoint {
  date: string
  precipitation: number | null
}

interface CalendarHeatmapProps {
  data: PrecipitationDataPoint[]
  width?: number
  height?: number
}

export default function CalendarHeatmap({
  data,
  width = 1000,
  height = 350,
}: CalendarHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width, height })
  const [hoveredPoint, setHoveredPoint] = useState<PrecipitationDataPoint | null>(null)

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

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Set up dimensions and margins - more top space, less bottom
    const margin = { top: 90, right: 140, bottom: 20, left: 70 }
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

    // Parse dates and organize data
    const parseDate = d3.timeParse('%Y-%m-%d')
    const parsedData = data
      .filter(d => d.precipitation !== null)
      .map(d => ({
        date: parseDate(d.date)!,
        precipitation: d.precipitation!,
      }))

    if (parsedData.length === 0) return

    // Group by week and day of week
    const weekFormat = d3.timeFormat('%U') // Week number
    const dayFormat = d3.timeFormat('%w') // Day of week (0-6, Sunday-Saturday)
    const monthFormat = d3.timeFormat('%b')

    // Calculate cell size - use full available height for 7 days
    const cellPadding = 2
    const cellSize = Math.floor((chartHeight - cellPadding * 6) / 7) // Divide height equally among 7 days
    
    // Also ensure it doesn't get too wide
    const maxCellWidth = Math.floor((chartWidth - cellPadding * 52) / 53)
    const finalCellSize = Math.min(cellSize, maxCellWidth) - cellPadding

    // Color scale for precipitation
    const maxPrecipitation = d3.max(parsedData, d => d.precipitation) || 50
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, maxPrecipitation])

    // Create cells
    const cells = g
      .selectAll('.cell')
      .data(parsedData)
      .join('rect')
      .attr('class', 'cell')
      .attr('x', d => {
        const weekNum = parseInt(weekFormat(d.date))
        return weekNum * (finalCellSize + cellPadding)
      })
      .attr('y', d => {
        const dayNum = parseInt(dayFormat(d.date))
        return dayNum * (finalCellSize + cellPadding)
      })
      .attr('width', finalCellSize)
      .attr('height', finalCellSize)
      .attr('rx', 2)
      .attr('fill', d => (d.precipitation > 0 ? colorScale(d.precipitation) : '#e5e7eb'))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .attr('stroke', '#1f2937')
          .attr('stroke-width', 2.5)
          .raise()

        setHoveredPoint({
          date: d3.timeFormat('%Y-%m-%d')(d.date),
          precipitation: d.precipitation,
        })

        if (tooltipRef.current) {
          const tooltip = d3.select(tooltipRef.current)
          tooltip
            .style('opacity', 1)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
        }
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke', '#ffffff').attr('stroke-width', 1)

        setHoveredPoint(null)

        if (tooltipRef.current) {
          d3.select(tooltipRef.current).style('opacity', 0)
        }
      })

    // Add month labels
    const months = d3.timeMonths(
      d3.timeMonth.floor(parsedData[0].date),
      d3.timeMonth.ceil(parsedData[parsedData.length - 1].date)
    )

    g.selectAll('.month-label')
      .data(months)
      .join('text')
      .attr('class', 'month-label')
      .attr('x', d => {
        const weekNum = parseInt(weekFormat(d))
        return weekNum * (finalCellSize + cellPadding) + finalCellSize / 2
      })
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-sm font-medium fill-gray-700 dark:fill-gray-300')
      .text(d => monthFormat(d))

    // Add day labels
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    g.selectAll('.day-label')
      .data(dayLabels)
      .join('text')
      .attr('class', 'day-label')
      .attr('x', -10)
      .attr('y', (d, i) => i * (finalCellSize + cellPadding) + finalCellSize / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('class', 'text-sm font-medium fill-gray-700 dark:fill-gray-300')
      .text(d => d)

    // Add title
    svg
      .append('text')
      .attr('x', dimensions.width / 2)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-2xl font-bold fill-gray-800 dark:fill-gray-200')
      .text('Daily Precipitation - Last 12 Months')

    // Add color legend
    const legendWidth = 240
    const legendHeight = 24
    const legend = svg
      .append('g')
      .attr('transform', `translate(${0}, 250)`)

    // Legend title
    legend
      .append('text')
      .attr('x', legendWidth / 2)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-sm font-semibold fill-gray-700 dark:fill-gray-300')
      .text('Precipitation (mm)')

    // Create gradient for legend
    const defs = svg.append('defs')
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'precipitation-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%')

    gradient
      .selectAll('stop')
      .data(d3.range(0, 1.1, 0.1))
      .join('stop')
      .attr('offset', d => `${d * 100}%`)
      .attr('stop-color', d => colorScale(d * maxPrecipitation))

    legend
      .append('rect')
      .attr('y', 12)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#precipitation-gradient)')
      .attr('stroke', '#9ca3af')
      .attr('stroke-width', 1)
      .attr('rx', 3)

    // Legend scale labels
    legend
      .append('text')
      .attr('x', 0)
      .attr('y', 52)
      .attr('class', 'text-xs fill-gray-600 dark:fill-gray-400')
      .text('0')

    legend
      .append('text')
      .attr('x', legendWidth / 2)
      .attr('y', 52)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-xs fill-gray-600 dark:fill-gray-400')
      .text(`${(maxPrecipitation / 2).toFixed(0)}`)

    legend
      .append('text')
      .attr('x', legendWidth)
      .attr('y', 52)
      .attr('text-anchor', 'end')
      .attr('class', 'text-xs fill-gray-600 dark:fill-gray-400')
      .text(`${maxPrecipitation.toFixed(0)}+`)

    // Add note about gray cells
    legend
      .append('text')
      .attr('x', legendWidth / 2)
      .attr('y', 70)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-xs italic fill-gray-500 dark:fill-gray-500')
      .text('Gray cells = No precipitation')
  }, [data, dimensions])

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="w-full overflow-x-auto">
        <svg 
          ref={svgRef} 
          width={dimensions.width} 
          height={dimensions.height}
          style={{ minWidth: '900px' }}
          className="min-w-full"
        />
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none opacity-0 transition-opacity bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm z-10 min-w-[200px]"
        style={{ opacity: hoveredPoint ? 1 : 0 }}
      >
        {hoveredPoint && (
          <>
            <div className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
              {d3.timeFormat('%B %d, %Y')(new Date(hoveredPoint.date))}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{
                    backgroundColor:
                      hoveredPoint.precipitation! > 0
                        ? d3.interpolateBlues(
                            hoveredPoint.precipitation! /
                              (d3.max(data.map(d => d.precipitation || 0)) || 50)
                          )
                        : '#e5e7eb',
                  }}
                ></div>
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{hoveredPoint.precipitation?.toFixed(1)} mm</span>
                </span>
              </div>
              {hoveredPoint.precipitation === 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                  No precipitation
                </div>
              )}
              {hoveredPoint.precipitation! > 0 && (
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {hoveredPoint.precipitation! < 2.5
                    ? '💧 Light rain'
                    : hoveredPoint.precipitation! < 10
                    ? '💧💧 Moderate rain'
                    : hoveredPoint.precipitation! < 50
                    ? '💧💧💧 Heavy rain'
                    : '🌊 Very heavy rain'}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}