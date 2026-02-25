import { ITunesTrack } from "./itunes";

export type HotTrack = {
    trackId: string;
    count: number;
};

export type HotTrackWithMeta = ITunesTrack & {
    trendingScore: number;
};
