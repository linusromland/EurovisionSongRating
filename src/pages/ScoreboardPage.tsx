import { decompressFromEncodedURIComponent } from 'lz-string';

import { Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { EloRatings, Song } from '../types';
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
                const parsedData = JSON.parse(decompressedData);

                const deMinifiedRatings: { [key: string]: { elo: number; numberOfVotes: number } } = {};
                Object.entries(parsedData.ratings).forEach(([key, value]) => {
                    if (typeof value === 'object' && value !== null && 'elo' in value) {
                        let elo: number;

                        if (typeof value.elo === 'string') {
                            elo = parseFloat(value.elo as string);
                        } else if (typeof value.elo === 'number') {
                            elo = value.elo;
                        } else {
                            return;
                        }

                        console.log(key);

                        deMinifiedRatings[key] = { elo, numberOfVotes: 0 };
                    }
                });
                parsedData.ratings = deMinifiedRatings;

                setName(parsedData.name);
                setEloRatings(parsedData.ratings);
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
