import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { TimeSeriesDataPoint } from '@/lib/chartUtils'

interface DataPoint {
  year: number
  renewable: number
  nonRenewable: number
}

interface StackedAreaChartProps {
  data: TimeSeriesDataPoint[] // Renewable energy percentage data
  width?: number
  height?: number
}

export default function StackedAreaChart({ 
  data, 
  width = 800, 
  height = 400 
}: StackedAreaChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width, height })
  const [hoveredData, setHoveredData] = useState<DataPoint | null>(null)

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

    // Prepare data: filter out nulls and calculate non-renewable percentage
    const chartData: DataPoint[] = data
      .filter(d => d.value !== null)
      .map(d => ({
        year: parseInt(d.year.toString()),
        renewable: d.value!,
        nonRenewable: 100 - d.value!,
      }))

    if (chartData.length === 0) return

    // Responsive margins - reduce on mobile
    const baseMargin = { top: 20, right: 20, bottom: 50, left: 60 }
    const responsiveMargin = {
      top: baseMargin.top,
      right: dimensions.width < 640 ? 20 : baseMargin.right,
      bottom: baseMargin.bottom,
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

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(chartData, d => d.year) as [number, number])
      .range([0, chartWidth])

    const yScale = d3
      .scaleLinear()
      .domain([0, 100]) // Always 0-100%
      .range([chartHeight, 0])

    // Create stack generator
    const stack = d3
      .stack<DataPoint>()
      .keys(['nonRenewable', 'renewable'])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)

    const stackedData = stack(chartData)

    // Color scale
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(['nonRenewable', 'renewable'])
      .range(['#ef4444', '#10b981']) // red for non-renewable, green for renewable

    // Create area generator
    const area = d3
      .area<d3.SeriesPoint<DataPoint>>()
      .x(d => xScale(d.data.year))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveMonotoneX) // Smooth curves

    // Draw stacked areas
    g.selectAll('.area')
      .data(stackedData)
      .join('path')
      .attr('class', 'area')
      .attr('fill', d => colorScale(d.key))
      .attr('d', area)
      .attr('opacity', 0.8)
      .style('transition', 'opacity 0.2s')
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 1)
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.8)
      })

    // Get all years
    const allYears = chartData.map(d => d.year).sort((a, b) => a - b)

    // Responsive tick filtering for X-axis
    const getTickValues = (width: number, years: number[]) => {
      let step: number
      
      if (width < 400) {
        step = 5 // Show every 5th year on very small screens
      } else if (width < 640) {
        step = 3 // Show every 3rd year on small screens
      } else if (width < 768) {
        step = 2 // Show every 2nd year on tablets
      } else {
        step = 1 // Show all years on desktop
      }
      
      return years.filter((_, index) => index % step === 0)
    }

    // Add X axis with responsive ticks
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(getTickValues(chartWidth, allYears))
      .tickFormat(d3.format('d'))
    
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .attr('class', 'text-gray-600 dark:text-gray-400')
      .selectAll('text')
      .attr('class', 'fill-gray-600 dark:fill-gray-400')

    // Add Y axis
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`)
    g.append('g')
      .call(yAxis)
      .attr('class', 'text-gray-600 dark:text-gray-400')
      .selectAll('text')
      .attr('class', 'fill-gray-600 dark:fill-gray-400')

    // Add X axis label
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-sm font-medium fill-gray-700 dark:fill-gray-300')
      .text('Year')

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chartHeight / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-sm font-medium fill-gray-700 dark:fill-gray-300')
      .text('Energy Mix (%)')

    // Add invisible overlay for tooltip
    const overlay = g
      .append('rect')
      .attr('class', 'overlay')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')

    // Add tooltip interaction
    overlay.on('mousemove', function(event) {
      const [mouseX] = d3.pointer(event, this)
      const year = Math.round(xScale.invert(mouseX))
      
      // Find closest data point
      const dataPoint = chartData.find(d => d.year === year)
      
      if (dataPoint && tooltipRef.current) {
        setHoveredData(dataPoint)
        
        const tooltip = d3.select(tooltipRef.current)
        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
      }
    })

    overlay.on('mouseout', () => {
      setHoveredData(null)
      if (tooltipRef.current) {
        d3.select(tooltipRef.current).style('opacity', 0)
      }
    })

    // Style axis lines and ticks
    svg.selectAll('.domain, .tick line')
      .attr('stroke', 'currentColor')
      .attr('class', 'stroke-gray-300 dark:stroke-gray-600')

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
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }} />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Renewable
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Non-Renewable
          </span>
        </div>
      </div>
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed pointer-events-none opacity-0 transition-opacity bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 text-sm z-50"
        style={{ opacity: hoveredData ? 1 : 0 }}
      >
        {hoveredData && (
          <>
            <div className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Year {hoveredData.year}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Renewable: {hoveredData.renewable.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Non-Renewable: {hoveredData.nonRenewable.toFixed(1)}%
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}