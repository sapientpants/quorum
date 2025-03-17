/**
 * Loading fallback component for page transitions
 */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
