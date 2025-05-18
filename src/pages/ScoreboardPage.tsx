import { decompressFromEncodedURIComponent } from 'lz-string';

import { Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { EloRatings, Song, UrlData } from '../types';
import { initialSongsData } from '../data/songData';
import { Scoreboard } from '../components/Scoreboard/Scoreboard';

export function ScoreboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [eloRatings, setEloRatings] = useState<EloRatings>({});
    const [name, setName] = useState<string>('');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const dataParam = urlParams.get('data');
        if (dataParam) {
            try {
                const decodedData = atob(dataParam);
                const decompressedData = decompressFromEncodedURIComponent(decodedData);
                const minifiedParsedData: UrlData = JSON.parse(decompressedData);

                const deMinifiedRatings: { [key: string]: { elo: number; numberOfVotes: number } } = {};

                Object.entries(minifiedParsedData.ratings).forEach(([key, value]) => {
                    if (typeof value === 'string' && value !== null) {
                        let elo: number;

                        if (typeof value === 'string') {
                            elo = parseFloat(value as string);
                        } else if (typeof value === 'number') {
                            elo = value;
                        } else {
                            return;
                        }

                        deMinifiedRatings[key] = { elo, numberOfVotes: 0 };
                    }
                });

                const ratings: EloRatings = deMinifiedRatings as EloRatings;

                setName(minifiedParsedData.name);
                setEloRatings(ratings);
            } catch (error) {
                console.error('Error parsing data from URL:', error);
            }
        } else {
            window.location.href = '/';
        }

        setAllSongs(initialSongsData);
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <div class="loading-message">Initializing Eurovision Scoreboard...</div>;
    }

    return (
        <Fragment>
            <Scoreboard title={name} songs={allSongs} eloRatings={eloRatings} linkToOwnBoard />
        </Fragment>
    );
}
