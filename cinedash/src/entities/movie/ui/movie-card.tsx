import type { MouseEvent, ReactNode } from 'react'
import {
  FaBookmark,
  FaCircleCheck,
  FaCircleInfo,
  FaHeart,
  FaListCheck,
  FaRegCircleCheck,
  FaRegHeart,
} from 'react-icons/fa6'
import type { Movie } from '../model/types'

interface MovieCardProps {
  movie: Movie
  estaEmSetlistDestaque?: boolean
  nomeSetlistDestaque?: string
  onOpenDetails: (movieId: number) => void
  onToggleFavorite: (movieId: number) => void
  onOpenSetlistModal: (movieId: number) => void
  onOpenWatchlistModal: (movieId: number) => void
  onToggleWatched: (movieId: number) => void
  labels: {
    favorite: string
    unfavorite: string
    setlist: string
    addWatchlist: string
    removeWatchlist: string
    markWatched: string
    unmarkWatched: string
    details: string
    noImage: string
    indicadorFavoritado: string
    indicadorAssistido: string
    indicadorNaSetlist: string
    maisSetlists: string
  }
}

const LIMITE_OVERVIEW_CARACTERES = 250

function stopCardNavigation(evento: MouseEvent<HTMLButtonElement>): void {
  evento.stopPropagation()
}

interface IconActionButtonProps {
  label: string
  onClick: (evento: MouseEvent<HTMLButtonElement>) => void
  children: ReactNode
  colorClassName: string
}

function IconActionButton({
  label,
  onClick,
  children,
  colorClassName,
}: IconActionButtonProps) {
  return (
    <div className="relative group/action">
      <button
        type="button"
        className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white transition hover:scale-105 ${colorClassName}`}
        onClick={onClick}
      >
        {children}
      </button>

      <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 rounded-md bg-slate-950/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-100 opacity-0 transition duration-200 group-hover/action:opacity-100">
        {label}
      </span>
    </div>
  )
}

export function MovieCard({
  movie,
  estaEmSetlistDestaque = false,
  nomeSetlistDestaque,
  onOpenDetails,
  onToggleFavorite,
  onOpenSetlistModal,
  onOpenWatchlistModal,
  onToggleWatched,
  labels,
}: MovieCardProps) {
  const imagemPrincipal = movie.backdropUrl || movie.posterUrl
  const overviewNormalizada = movie.overview.trim()
  const overviewExibicao = overviewNormalizada
    ? overviewNormalizada.length > LIMITE_OVERVIEW_CARACTERES
      ? `${overviewNormalizada.slice(0, LIMITE_OVERVIEW_CARACTERES).trimEnd()}...`
      : overviewNormalizada
    : '-'

  return (
    <article
      className={`relative overflow-hidden transition-transform shadow-lg cursor-pointer group min-h-80 rounded-2xl bg-slate-950 hover:-translate-y-1 hover:shadow-xl ${
        estaEmSetlistDestaque
          ? 'border-2 border-rose-500 shadow-rose-500/30 hover:shadow-rose-500/40 ring-1 ring-rose-500/50'
          : 'border border-slate-200/80 shadow-slate-800/20 hover:shadow-slate-800/30 dark:border-slate-700'
      }`}
      onClick={() => {
        onOpenDetails(movie.id)
      }}
    >
      {imagemPrincipal ? (
        <img
          src={imagemPrincipal}
          alt={movie.title}
          className="absolute inset-0 object-cover w-full h-full"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200">
          {labels.noImage}
        </div>
      )}

      <div className="absolute inset-0 transition-colors bg-black/20 group-hover:bg-black/50" />

      <div className="relative z-10 h-full p-4 text-slate-100">
        {(movie.watched || movie.isFavorite || estaEmSetlistDestaque) ? (
          <div className="absolute z-20 bottom-4 left-4 right-4 flex items-center gap-1.5">
            {movie.isFavorite ? (
              <div className="group/indicator relative inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-full shadow-lg bg-amber-300/95 text-amber-900 shadow-black/20">
                <FaHeart size={14} />
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-100 opacity-0 transition duration-200 group-hover/indicator:opacity-100">
                  {labels.indicadorFavoritado}
                </span>
              </div>
            ) : null}
            {movie.watched ? (
              <div className="group/indicator relative inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-full shadow-lg bg-emerald-300/95 text-emerald-900 shadow-black/20">
                <FaCircleCheck size={14} />
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-100 opacity-0 transition duration-200 group-hover/indicator:opacity-100">
                  {labels.indicadorAssistido}
                </span>
              </div>
            ) : null}
            {estaEmSetlistDestaque ? (
              <div className="group/indicator relative inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-full shadow-lg bg-rose-400/95 text-white shadow-black/20">
                <FaBookmark size={14} />
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-100 opacity-0 transition duration-200 group-hover/indicator:opacity-100">
                  {nomeSetlistDestaque ?? labels.indicadorNaSetlist}
                </span>
              </div>
            ) : null}

            {movie.setlists.length > 0 ? (
              <div className="flex items-center gap-1 ml-auto min-w-0">
                {movie.setlists.slice(0, 2).map((setlistAtual) => (
                  <span
                    key={`${movie.id}-setlist-${setlistAtual}`}
                    className="truncate max-w-[80px] rounded-full bg-emerald-500/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-white"
                  >
                    {setlistAtual}
                  </span>
                ))}
                {movie.setlists.length > 2 ? (
                  <div className="group/more relative">
                    <span className="rounded-full bg-emerald-500/80 px-2 py-0.5 text-[9px] font-semibold text-white cursor-default">
                      ...
                    </span>
                    <span className="pointer-events-none absolute -top-8 right-0 whitespace-nowrap rounded-md bg-slate-950/95 px-2 py-1 text-[10px] font-semibold text-slate-100 opacity-0 transition duration-200 group-hover/more:opacity-100">
                      {movie.setlists.slice(2).join(', ')}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

          <div className="flex flex-col justify-between h-full transition-opacity duration-200 group-hover:opacity-0">
          <div>
            <div className="flex flex-wrap gap-2">
              {movie.genres.slice(0, 3).map((genero) => (
                <span
                  key={`${movie.id}-${genero}`}
                  className="rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                >
                  {genero}
                </span>
              ))}
            </div>

            <h3 className="mt-3 text-xl font-semibold leading-tight">{movie.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200/95">
              {overviewExibicao}
            </p>
          </div>
        </div>

        <div className="absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-200 opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100">
          <div className="flex flex-wrap items-center justify-center gap-3 px-5">
            <IconActionButton
              label={movie.isFavorite ? labels.unfavorite : labels.favorite}
              colorClassName="hover:border-amber-300 hover:bg-amber-500/75"
              onClick={(evento) => {
                stopCardNavigation(evento)
                onToggleFavorite(movie.id)
              }}
            >
              {movie.isFavorite ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
            </IconActionButton>

            <IconActionButton
              label={labels.setlist}
              colorClassName="hover:border-cyan-300 hover:bg-cyan-600/75"
              onClick={(evento) => {
                stopCardNavigation(evento)
                onOpenSetlistModal(movie.id)
              }}
            >
              <FaListCheck size={18} />
            </IconActionButton>

            <IconActionButton
              label={movie.inWatchlist ? labels.removeWatchlist : labels.addWatchlist}
              colorClassName="hover:border-indigo-300 hover:bg-indigo-600/75"
              onClick={(evento) => {
                stopCardNavigation(evento)
                onOpenWatchlistModal(movie.id)
              }}
            >
              <FaBookmark size={18} />
            </IconActionButton>

            <IconActionButton
              label={movie.watched ? labels.unmarkWatched : labels.markWatched}
              colorClassName="hover:border-emerald-300 hover:bg-emerald-600/75"
              onClick={(evento) => {
                stopCardNavigation(evento)
                onToggleWatched(movie.id)
              }}
            >
              {movie.watched ? (
                <FaCircleCheck size={18} />
              ) : (
                <FaRegCircleCheck size={18} />
              )}
            </IconActionButton>

            <IconActionButton
              label={labels.details}
              colorClassName="hover:border-slate-300 hover:bg-slate-700/80"
              onClick={(evento) => {
                stopCardNavigation(evento)
                onOpenDetails(movie.id)
              }}
            >
              <FaCircleInfo size={18} />
            </IconActionButton>
          </div>
        </div>
      </div>
    </article>
  )
}
