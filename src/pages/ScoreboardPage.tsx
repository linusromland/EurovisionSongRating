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
                const parsedData = JSON.parse(decodedData);
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
