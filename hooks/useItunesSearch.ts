"use client"

import { useState, useCallback } from "react"
import { ITunesTrack, SearchTrackParams } from "@/types/itunes"
import { searchTracks, getTopTracks } from "@/services/itunesService"

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
    setState(s => ({ ...s, loading: true, error: null }))

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

  const fetchTopTracks = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))

    try {
      const results = await getTopTracks()
      if (results.length === 0) {
        throw new Error("No tracks found in top charts")
      }

      // Shuffle results for "random" feel
      const shuffled = [...results].sort(() => 0.5 - Math.random())
      setState({ tracks: shuffled, loading: false, error: null })
      return shuffled
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch top tracks"
      console.error("Hook fetchTopTracks failed:", errorMessage)
      setState(s => ({ ...s, loading: false, error: errorMessage }))
      throw error // Propagate to trigger fallback in Home page
    }
  }, [])

  return {
    tracks: state.tracks,
    loading: state.loading,
    error: state.error,
    search,
    fetchTopTracks,
  }
}
