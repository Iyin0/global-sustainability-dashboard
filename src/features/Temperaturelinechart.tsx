import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface TemperatureDataPoint {
  date: string
  maxTemp: number | null
  minTemp: number | null
}

interface TemperatureLineChartProps {
  data: TemperatureDataPoint[]
  width?: number
  height?: number
}

export default function TemperatureLineChart({
  data,
  width = 1000,
  height = 400,
}: TemperatureLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width, height })
  const [hoveredPoint, setHoveredPoint] = useState<TemperatureDataPoint | null>(null)

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

    // Filter out data points with null values
    const validData = data.filter(d => d.maxTemp !== null && d.minTemp !== null)
    if (validData.length === 0) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Responsive margins - reduce on mobile
    const baseMargin = { top: 40, right: 20, bottom: 60, left: 60 }
    const responsiveMargin = {
      top: baseMargin.top,
      right: dimensions.width < 640 ? 20 : baseMargin.right,
      bottom: dimensions.width < 640 ? 70 : baseMargin.bottom, // Extra space for rotated labels
      left: dimensions.width < 640 ? 40 : baseMargin.left,
    }

    const chartWidth = dimensions.width - responsiveMargin.left - responsiveMargin.right
    const chartHeight = dimensions.height - responsiveMargin.top - responsiveMargin.bottom

    // Prevent rendering if dimensions are too small
    if (chartWidth <= 0 || chartHeight <= 0) return

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)

    const g = svg
      .append('g')
      .attr('transform', `translate(${responsiveMargin.left},${responsiveMargin.top})`)

    // Parse dates
    const parseDate = d3.timeParse('%Y-%m-%d')
    const parsedData = validData.map(d => ({
      date: parseDate(d.date)!,
      maxTemp: d.maxTemp!,
      minTemp: d.minTemp!,
    }))

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(parsedData, d => d.date) as [Date, Date])
      .range([0, chartWidth])

    const allTemps = [
      ...parsedData.map(d => d.maxTemp),
      ...parsedData.map(d => d.minTemp),
    ]
    const yScale = d3
      .scaleLinear()
      .domain([d3.min(allTemps)! - 5, d3.max(allTemps)! + 5])
      .range([chartHeight, 0])
      .nice()

    // Add grid lines
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

    // Add filled area between min and max
    const area = d3
      .area<{ date: Date; maxTemp: number; minTemp: number }>()
      .x(d => xScale(d.date))
      .y0(d => yScale(d.minTemp))
      .y1(d => yScale(d.maxTemp))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(parsedData)
      .attr('fill', '#3b82f6')
      .attr('fill-opacity', 0.2)
      .attr('d', area)

    // Create line generators
    const maxLine = d3
      .line<{ date: Date; maxTemp: number; minTemp: number }>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.maxTemp))
      .curve(d3.curveMonotoneX)

    const minLine = d3
      .line<{ date: Date; maxTemp: number; minTemp: number }>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.minTemp))
      .curve(d3.curveMonotoneX)

    // Draw max temperature line
    g.append('path')
      .datum(parsedData)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('d', maxLine)

    // Draw min temperature line
    g.append('path')
      .datum(parsedData)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', minLine)

    // Responsive tick filtering for X-axis
    const getTickCount = (width: number) => {
      if (width < 400) {
        return 3 // Very few ticks on very small screens
      } else if (width < 640) {
        return 4 // Fewer ticks on small screens
      } else if (width < 768) {
        return 6 // Moderate ticks on tablets
      } else {
        return 12 // Full ticks on desktop
      }
    }

    // Add X axis with responsive ticks
    const xAxis = d3
      .axisBottom<Date>(xScale)
      .ticks(getTickCount(chartWidth))
      .tickFormat(d3.timeFormat('%b %Y'))

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .attr('class', 'text-gray-600 dark:text-gray-400')
      .selectAll('text')
      .attr('class', 'fill-gray-600 dark:fill-gray-400')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')

    // Add Y axis
    const yAxis = d3.axisLeft(yScale).ticks(8)

    g.append('g')
      .call(yAxis)
      .attr('class', 'text-gray-600 dark:text-gray-400')
      .selectAll('text')
      .attr('class', 'fill-gray-600 dark:fill-gray-400')

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chartHeight / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-sm font-semibold fill-gray-700 dark:fill-gray-300')
      .text('Temperature (°C)')

    // Add title with responsive font size
    const titleText = 'Daily Temperature Range - Last 12 Months'
    const titleFontSize = dimensions.width < 640 ? 'text-sm' : 'text-lg'
    const titleY = dimensions.width < 640 ? 20 : 25
    
    svg
      .append('text')
      .attr('x', dimensions.width / 2)
      .attr('y', titleY)
      .attr('text-anchor', 'middle')
      .attr('class', `${titleFontSize} font-bold fill-gray-800 dark:fill-gray-200`)
      .text(dimensions.width < 500 ? 'Temperature Range - 12 Months' : titleText)

    // Add overlay for tooltip
    const overlay = g
      .append('rect')
      .attr('class', 'overlay')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')

    // Bisector for finding closest data point
    const bisect = d3.bisector((d: { date: Date }) => d.date).left

    overlay.on('mousemove', function (event) {
      const [mouseX] = d3.pointer(event, this)
      const date = xScale.invert(mouseX)
      const index = bisect(parsedData, date)
      const d0 = parsedData[index - 1]
      const d1 = parsedData[index]
      const d = d1 && date.getTime() - d0?.date.getTime() > d1.date.getTime() - date.getTime() ? d1 : d0

      if (d && tooltipRef.current) {
        setHoveredPoint({
          date: d3.timeFormat('%Y-%m-%d')(d.date),
          maxTemp: d.maxTemp,
          minTemp: d.minTemp,
        })

        const tooltip = d3.select(tooltipRef.current)
        tooltip
          .style('opacity', 1)
          .style('left', `${event.clientX + 10}px`)
          .style('top', `${event.clientY - 10}px`)

        // Draw focus circles
        g.selectAll('.focus-circle').remove()
        
        g.append('circle')
          .attr('class', 'focus-circle')
          .attr('cx', xScale(d.date))
          .attr('cy', yScale(d.maxTemp))
          .attr('r', 4)
          .attr('fill', '#ef4444')
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)

        g.append('circle')
          .attr('class', 'focus-circle')
          .attr('cx', xScale(d.date))
          .attr('cy', yScale(d.minTemp))
          .attr('r', 4)
          .attr('fill', '#3b82f6')
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
      }
    })

    overlay.on('mouseout', () => {
      setHoveredPoint(null)
      g.selectAll('.focus-circle').remove()
      if (tooltipRef.current) {
        d3.select(tooltipRef.current).style('opacity', 0)
      }
    })

    // Style axis lines
    svg
      .selectAll('.domain')
      .attr('stroke', 'currentColor')
      .attr('class', 'stroke-gray-300 dark:stroke-gray-600')

    svg.selectAll('.tick line').attr('class', 'stroke-gray-300 dark:stroke-gray-600')
  }, [data, dimensions])

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Chart - fully responsive without horizontal scroll */}
      <div className="w-full">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full" />
      </div>

      {/* Legend - moved to bottom */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
          <div className="w-8 h-0.5 rounded" style={{ backgroundColor: '#ef4444' }} />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Max Temp
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
          <div className="w-8 h-0.5 rounded" style={{ backgroundColor: '#3b82f6' }} />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Min Temp
          </span>
        </div>
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed pointer-events-none opacity-0 transition-opacity bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 text-sm z-50"
        style={{ opacity: hoveredPoint ? 1 : 0 }}
      >
        {hoveredPoint && (
          <>
            <div className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
              {d3.timeFormat('%B %d, %Y')(new Date(hoveredPoint.date))}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Max: <span className="font-medium">{hoveredPoint.maxTemp?.toFixed(1)}°C</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Min: <span className="font-medium">{hoveredPoint.minTemp?.toFixed(1)}°C</span>
                </span>
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                Range: {(hoveredPoint.maxTemp! - hoveredPoint.minTemp!).toFixed(1)}°C
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}