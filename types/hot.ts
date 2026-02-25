export type HotTrack = {
    trackId: string;
    count: number;
};

export type HotTrackWithMeta = {
    trackId: string;
    trackName: string;
    artistName: string;
    artworkUrl100: string;
    previewUrl: string;
    trendingScore: number;
};
