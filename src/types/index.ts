export interface Song {
    id: string;
    country: string;
    flag: string;
    artist: string;
    song: string;
    youtubeUrl: string;
    elo?: number;
}

export interface EloRatings {
    [songId: string]: number;
}