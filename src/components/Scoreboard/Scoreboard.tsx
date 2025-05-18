import { useState, useMemo, useCallback } from 'preact/hooks';
import type { Song, EloRatings } from '../../types';
import styles from './Scoreboard.module.css';
import { INITIAL_ELO, SCOREBOARD_INITIAL_LIMIT } from '../../data/songData';

interface ScoreboardProps {
    songs: Song[];
    eloRatings: EloRatings;
}

export function Scoreboard({ songs, eloRatings }: ScoreboardProps) {
    const [showAll, setShowAll] = useState(false);

    const sortedSongsFull = useMemo(() => {
        return [...songs]
            .map(song => ({ ...song, elo: eloRatings[song.id] || INITIAL_ELO }))
            .sort((a, b) => (b.elo ?? INITIAL_ELO) - (a.elo ?? INITIAL_ELO));
    }, [songs, eloRatings]);

    const songsToDisplay = useMemo(() => {
        if (showAll || sortedSongsFull.length <= SCOREBOARD_INITIAL_LIMIT) {
            return sortedSongsFull;
        }
        return sortedSongsFull.slice(0, SCOREBOARD_INITIAL_LIMIT);
    }, [sortedSongsFull, showAll]);

    const toggleShowAll = useCallback(() => {
        setShowAll(prev => !prev);
    }, []);

    if (songs.length === 0 && Object.keys(eloRatings).length === 0) { // Check if there are any songs processed
        return <div class={styles.infoMessage}>Your scoreboard is empty. Start voting!</div>;
    }
     if (songsToDisplay.length === 0) {
        return <div class={styles.infoMessage}>No songs to display in scoreboard yet.</div>;
    }


    return (
        <section class={styles.scoreboard}>
            <h2>Your Personal Scoreboard</h2>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Country</th>
                        <th>Song</th>
                        <th>Artist</th>
                        <th>ELO Rating</th>
                    </tr>
                </thead>
                <tbody>
                    {songsToDisplay.map((song, index) => (
                        <tr key={song.id}>
                            <td><span class={styles.rank}>{index + 1}</span></td>
                            <td>
                                <div class={styles.countryDetails}>
                                    <span class={styles.flag}>{song.flag}</span>
                                    <span class={styles.countryName}>{song.country}</span>
                                </div>
                            </td>
                            <td>{song.song}</td>
                            <td>{song.artist}</td>
                            <td>{Math.round(song.elo ?? INITIAL_ELO)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {sortedSongsFull.length > SCOREBOARD_INITIAL_LIMIT && (
                <button class={styles.toggleScoreboardButton} onClick={toggleShowAll}>
                    {showAll ? `Show Top ${SCOREBOARD_INITIAL_LIMIT}` : `Show All ${sortedSongsFull.length} Results`}
                </button>
            )}
        </section>
    );
}