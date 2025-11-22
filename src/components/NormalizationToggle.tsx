interface NormalizationToggleProps {
  method: 'minmax' | 'zscore'
  onMethodChange: (method: 'minmax' | 'zscore') => void
  className?: string
}

export default function NormalizationToggle({
  method,
  onMethodChange,
  className = '',
}: NormalizationToggleProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Normalization Method
      </label>
      
      <div className="flex gap-2">
        <button
          onClick={() => onMethodChange('minmax')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-all
            ${
              method === 'minmax'
                ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
        >
          Min-Max
        </button>
        
        <button
          onClick={() => onMethodChange('zscore')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-all
            ${
              method === 'zscore'
                ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
        >
          Z-Score
        </button>
      </div>

      {/* Explanation */}
      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
        {method === 'minmax' ? (
          <span>
            <strong>Min-Max:</strong> Scales values to 0-1 range
          </span>
        ) : (
          <span>
            <strong>Z-Score:</strong> Standardizes by standard deviations from mean
          </span>
        )}
      </div>
    </div>
  )
}