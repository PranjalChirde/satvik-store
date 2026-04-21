export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 aspect-square rounded-lg w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-32 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        <div className="aspect-square md:aspect-auto md:h-[500px] bg-gray-200 rounded-2xl"></div>
        <div className="flex flex-col">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3 mb-8">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded-lg w-full mb-8"></div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="h-20 bg-gray-200 rounded-lg w-full"></div>
            <div className="h-20 bg-gray-200 rounded-lg w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="h-10 bg-gray-100 rounded-t-lg border-b border-gray-200 mb-2"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-50 border-b border-gray-100 flex items-center px-6 gap-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
}
