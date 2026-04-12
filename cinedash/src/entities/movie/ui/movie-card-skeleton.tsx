export function MovieCardSkeleton() {
  return (
    <article className="relative min-h-80 animate-pulse overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-300/60 dark:border-slate-700 dark:bg-slate-800/70">
      <div className="absolute inset-0 bg-slate-400/35 dark:bg-slate-700/35" />

      <div className="relative z-10 flex h-full flex-col justify-between p-4">
        <div>
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded-full bg-slate-100/50 dark:bg-slate-500/40" />
            <div className="h-5 w-16 rounded-full bg-slate-100/50 dark:bg-slate-500/40" />
          </div>

          <div className="mt-3 h-6 w-4/5 rounded bg-slate-100/50 dark:bg-slate-500/40" />
          <div className="mt-2 h-3 w-full rounded bg-slate-100/50 dark:bg-slate-500/40" />
          <div className="mt-2 h-3 w-11/12 rounded bg-slate-100/50 dark:bg-slate-500/40" />
          <div className="mt-2 h-3 w-9/12 rounded bg-slate-100/50 dark:bg-slate-500/40" />
        </div>

        <div>
          <div className="mb-3 flex gap-2">
            <div className="h-5 w-20 rounded-full bg-slate-100/50 dark:bg-slate-500/40" />
            <div className="h-5 w-16 rounded-full bg-slate-100/50 dark:bg-slate-500/40" />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="h-8 w-16 rounded-lg bg-slate-100/50 dark:bg-slate-500/40" />
            <div className="h-8 w-16 rounded-lg bg-slate-100/50 dark:bg-slate-500/40" />
            <div className="h-8 w-20 rounded-lg bg-slate-100/50 dark:bg-slate-500/40" />
            <div className="h-8 w-20 rounded-lg bg-slate-100/50 dark:bg-slate-500/40" />
            <div className="h-8 w-16 rounded-lg bg-slate-100/50 dark:bg-slate-500/40" />
          </div>
        </div>
      </div>
    </article>
  )
}
