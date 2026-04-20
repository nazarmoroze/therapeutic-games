export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-200" />
          <div>
            <div className="h-7 w-52 bg-slate-200 rounded-lg mb-2" />
            <div className="h-4 w-36 bg-slate-100 rounded-lg" />
          </div>
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-xl" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 px-5 py-4 col-span-1">
            <div className="h-8 w-12 bg-slate-200 rounded mb-1.5" />
            <div className="h-3 w-28 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Sessions list */}
      <div>
        <div className="h-5 w-36 bg-slate-200 rounded mb-3" />
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4"
            >
              <div className="w-5 h-5 rounded-full bg-slate-200 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-48 bg-slate-200 rounded mb-1.5" />
                <div className="h-3 w-32 bg-slate-100 rounded" />
              </div>
              <div className="h-6 w-8 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
