import { createColorScale } from '@/lib/mapUtil'

interface MapLegendProps {
  min: number
  max: number
  title?: string
}

export default function MapLegend({ min, max, title = 'Renewable Energy (%)' }: MapLegendProps) {
  const colorScale = createColorScale([min, max])
  const steps = 7

  // Generate legend items
  const legendItems = Array.from({ length: steps }, (_, i) => {
    const value = min + (max - min) * (i / (steps - 1))
    return {
      value: value.toFixed(1),
      color: colorScale(value),
    }
  })

  return (
    <div className="card">
      <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <div className="space-y-1">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-8 h-4 rounded border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 rounded border border-gray-300 dark:border-gray-600 bg-gray-200" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            No Data
          </span>
        </div>
      </div>
    </div>
  )
}