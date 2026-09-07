export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">Rental Report</p>
          <p className="mt-1 text-xs text-gray-500">Memuat halaman...</p>
        </div>
      </div>
    </div>
  );
}
