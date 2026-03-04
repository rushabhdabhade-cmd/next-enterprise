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

export interface ITunesSearchResponse {
  resultCount: number
  results: ITunesTrack[]
}

export interface SearchTrackParams {
  term: string
  entity?: "song" | "album" | "artist"
  limit?: number
}
