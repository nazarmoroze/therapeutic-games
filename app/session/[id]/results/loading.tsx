export default function ResultsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
      {/* Back link */}
      <div className="h-4 w-36 bg-slate-200 rounded mb-8" />

      {/* Hero score card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-200" />
          <div className="h-7 w-44 bg-slate-200 rounded" />
          <div className="h-4 w-56 bg-slate-100 rounded" />
          <div className="h-20 w-24 bg-slate-200 rounded-xl mt-2" />
        </div>
      </div>

      {/* Radar chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="h-5 w-48 bg-slate-200 rounded mb-4" />
        <div className="h-64 bg-slate-100 rounded-xl" />
      </div>

      {/* Game breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="h-5 w-36 bg-slate-200 rounded mb-5" />
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-200 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                <div className="h-2 bg-slate-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PDF section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
        <div className="h-3 w-64 bg-slate-100 rounded mb-4" />
        <div className="h-10 w-44 bg-slate-200 rounded-xl" />
      </div>
    </div>
  )
}
