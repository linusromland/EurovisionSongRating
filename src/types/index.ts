export interface Song {
    id: string;
    country: string;
    flag: string;
    artist: string;
    song: string;
    youtubeUrl: string;
    elo?: number;
    numberOfVotes?: number;
}

export interface EloRatings {
    [songId: string]: {
        elo: number;
        numberOfVotes: number;
    };
}

export type UrlData = {
    name: string;
    ratings: {
         [key:string]: string
    };
};