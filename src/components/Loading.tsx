export default function Loading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
          </div>
        </div>
      </div>
  )
}