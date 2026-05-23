export default function Loading() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded-lg mb-2"></div>
        <div className="h-6 w-96 bg-muted rounded-lg"></div>
      </div>

      {/* Course Description Skeleton */}
      <div className="mb-8 p-6 rounded-2xl bg-card border border-border">
        <div className="h-6 w-48 bg-muted rounded-lg mb-3 animate-pulse"></div>
        <div className="space-y-2 mb-5">
          <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-24 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Modules Grid Skeleton */}
      <div className="h-5 w-32 bg-muted rounded-lg mb-4 animate-pulse"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {[1, 2].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-card border border-border">
            <div className="space-y-4 animate-pulse">
              <div className="h-6 w-3/4 bg-muted rounded-lg"></div>
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-2/3 bg-muted rounded"></div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-muted rounded-lg"></div>
                <div className="h-8 w-16 bg-muted rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
