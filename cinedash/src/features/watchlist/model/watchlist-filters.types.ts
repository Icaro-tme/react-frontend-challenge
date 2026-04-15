export const WATCHLIST_STATUS_FILTERS = [
  'todos',
  'assistidos',
  'pendentes',
  'favoritos',
] as const

export type WatchlistStatusFilter = (typeof WATCHLIST_STATUS_FILTERS)[number]

export const WATCHLIST_SORT_FIELDS = ['titulo', 'genero', 'nota'] as const

export type WatchlistSortField = (typeof WATCHLIST_SORT_FIELDS)[number]

export const WATCHLIST_SORT_DIRECTIONS = ['asc', 'desc'] as const

export type WatchlistSortDirection = (typeof WATCHLIST_SORT_DIRECTIONS)[number]
