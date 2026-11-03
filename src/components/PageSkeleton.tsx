export function PageSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4 lg:gap-6" aria-busy="true" aria-label="Cargando">
      <div className="h-11 w-48 rounded-icon bg-segment" />
      <div className="h-48 rounded-card bg-white" />
      <div className="h-64 rounded-card bg-white" />
    </div>
  );
}
