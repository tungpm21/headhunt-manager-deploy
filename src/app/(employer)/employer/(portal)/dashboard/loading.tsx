export default function EmployerDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-80 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-gray-100 bg-white p-5">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            <div className="mt-4 h-8 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-gray-100 bg-white p-5">
            <div className="mb-5 h-5 w-48 animate-pulse rounded bg-gray-200" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((__, row) => (
                <div key={row} className="h-4 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
