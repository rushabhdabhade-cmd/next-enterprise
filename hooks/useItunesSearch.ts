"use client"

import { useState, useCallback } from "react"
import { ITunesTrack, SearchTrackParams } from "@/types/itunes"
import { searchTracks } from "@/services/itunesService"

interface UseItunesSearchState {
  tracks: ITunesTrack[]
  loading: boolean
  error: string | null
}

export function useItunesSearch() {
  const [state, setState] = useState<UseItunesSearchState>({
    tracks: [],
    loading: false,
    error: null,
  })

  const search = useCallback(async (params: SearchTrackParams) => {
    setState({ tracks: [], loading: true, error: null })

    try {
      const response = await searchTracks(params)
      setState({ tracks: response.results, loading: false, error: null })
      return response.results
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch tracks"
      setState({ tracks: [], loading: false, error: errorMessage })
      throw error
    }
  }, [])

  return {
    tracks: state.tracks,
    loading: state.loading,
    error: state.error,
    search,
  }
}
