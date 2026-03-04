export interface ITunesTrack {
  wrapperType: string
  kind: string
  trackId: number
  artistId: number
  collectionId: number
  artistName: string
  collectionName: string
  trackName: string
  trackCensoredName: string
  previewUrl: string
  artworkUrl30: string
  artworkUrl60: string
  artworkUrl100: string
  trackPrice: number
  collectionPrice: number
  releaseDate: string
  trackTimeMillis: number
  country: string
  currency: string
  primaryGenreName: string
  isStreamable: boolean
  collectionExplicitness?: string
  trackExplicitness?: string
}

export interface ITunesPodcast {
  wrapperType: string
  kind: string
  collectionId: number
  trackId: number
  artistName: string
  collectionName: string
  trackName: string
  artworkUrl100: string
  artworkUrl600: string
  feedUrl: string
  trackCount: number
  releaseDate: string
  primaryGenreName: string
  contentAdvisoryRating: string
  genres: { name: string; id: string }[]
  collectionViewUrl: string
}

export interface ITunesMusicVideo {
  wrapperType: string
  kind: string
  trackId: number
  artistId: number
  trackName: string
  artistName: string
  collectionName: string
  artworkUrl100: string
  previewUrl: string
  trackTimeMillis: number
  primaryGenreName: string
  releaseDate: string
  trackPrice: number
  currency: string
  country: string
}

export interface ITunesSearchResponse {
  resultCount: number
  results: ITunesTrack[]
}

export interface SearchTrackParams {
  term: string
  entity?: "song" | "album" | "artist" | "podcast" | "musicVideo"
  limit?: number
}
