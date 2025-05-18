import {  Fragment } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import type { Song, EloRatings } from './types';
import { initialSongsData, K_FACTOR, INITIAL_ELO } from './data/songData';
import { calculateExpectedScore } from './utils/elo';
import { BattleZone } from './components/BattleZone/BattleZone';
import { Scoreboard } from './components/Scoreboard/Scoreboard';
import { ConfirmAction } from './components/ConfirmAction/ConfirmAction';
import confirmActionStyles from './components/ConfirmAction/ConfirmAction.module.css';

export function App() {
    const [eloRatings, setEloRatings] = useState<EloRatings>({});
    const [currentPair, setCurrentPair] = useState<[Song | null, Song | null]>([null, null]);
    const [isLoading, setIsLoading] = useState(true);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        setAllSongs(initialSongsData);
        const loadedRatingsRaw = localStorage.getItem('eurovisionEloRatings');
        const loadedRatings = loadedRatingsRaw ? JSON.parse(loadedRatingsRaw) : {};
        const initialRatings: EloRatings = {};
        initialSongsData.forEach(song => {
            initialRatings[song.id] = loadedRatings[song.id] || INITIAL_ELO;
        });
        setEloRatings(initialRatings);
        setIsLoading(false);
    }, []);

    const selectNewPair = useCallback(() => {
        if (allSongs.length < 2) {
            setCurrentPair([null, null]);
            return;
        }
        let songAIndex = -1, songBIndex = -1;
        let attempts = 0;
        const maxAttempts = allSongs.length * (allSongs.length - 1);
        const [prevSongA, prevSongB] = currentPair;

        do {
            songAIndex = Math.floor(Math.random() * allSongs.length);
            songBIndex = Math.floor(Math.random() * allSongs.length);
            attempts++;
            if (allSongs.length > 2 && prevSongA && prevSongB && attempts < maxAttempts / 2) {
                const currentSelectionIdA = allSongs[songAIndex].id;
                const currentSelectionIdB = allSongs[songBIndex].id;
                if ((currentSelectionIdA === prevSongA.id && currentSelectionIdB === prevSongB.id) ||
                    (currentSelectionIdA === prevSongB.id && currentSelectionIdB === prevSongA.id)) {
                    continue;
                }
            }
        } while (songAIndex === songBIndex && attempts < maxAttempts);

        if (songAIndex === songBIndex && allSongs.length > 1) {
            songBIndex = (songAIndex + 1) % allSongs.length;
        } else if (songAIndex === songBIndex && allSongs.length === 1) {
             setCurrentPair([allSongs[0], null]);
             return;
        }
        setCurrentPair([allSongs[songAIndex], allSongs[songBIndex]]);
    }, [allSongs, currentPair]);

    useEffect(() => {
        if (!isLoading && allSongs.length > 0 && currentPair[0] === null && currentPair[1] === null) {
            selectNewPair();
        }
    }, [isLoading, allSongs, currentPair, selectNewPair]);

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('eurovisionEloRatings', JSON.stringify(eloRatings));
        }
    }, [eloRatings, isLoading]);

    const handleVote = useCallback((winnerId: string, loserId: string) => {
        setEloRatings(prevRatings => {
            const winnerRating = prevRatings[winnerId] || INITIAL_ELO;
            const loserRating = prevRatings[loserId] || INITIAL_ELO;
            const expectedWinner = calculateExpectedScore(winnerRating, loserRating);
            const newWinnerRating = winnerRating + K_FACTOR * (1 - expectedWinner);
            const newLoserRating = loserRating + K_FACTOR * (0 - (1 - expectedWinner));
            return { ...prevRatings, [winnerId]: newWinnerRating, [loserId]: newLoserRating };
        });
    }, []);

    const openResetDialog = () => setIsResetConfirmOpen(true);
    const handleCancelReset = () => setIsResetConfirmOpen(false);

    const handleConfirmReset = useCallback(async () => {
        setIsResetting(true);
        
        const resetRatings: EloRatings = {};
        allSongs.forEach(song => {
            resetRatings[song.id] = INITIAL_ELO;
        });
        setEloRatings(resetRatings);
        localStorage.removeItem('eurovisionEloRatings');
        
        setIsResetting(false);
        setIsResetConfirmOpen(false);
    }, [allSongs]);

    if (isLoading) {
        return <div class="loading-message">Initializing Eurovision Scoreboard...</div>;
    }
    if (allSongs.length < 2 && !isLoading) {
        return (
            <div class="container">
                <header class="app-header"><h1>Eurovision 2025 Personal Scoreboard</h1></header>
                <div class="error-message">Not enough songs. Add at least two in `songsData.ts`.</div>
            </div>
        );
    }

    const [songA, songB] = currentPair;

    return (
        <Fragment>
            <div class="container">
                <header class="app-header">
                    <h1>Eurovision Song Rating</h1>
                    <p>Who will win your heart? Compare the songs from Eurovision Song Contest 2025 and build your ranking!</p>
                </header>

                {(songA && songB) ? (
                    <BattleZone songA={songA} songB={songB} onVote={handleVote} />
                ) : (
                    allSongs.length >= 2 && <div class="loading-message">Selecting next pair...</div>
                )}

                <Scoreboard songs={allSongs} eloRatings={eloRatings} clearScoreboard={openResetDialog} />
            </div>

            <ConfirmAction
                isOpen={isResetConfirmOpen}
                title="Reset Scoreboard?"
                message="Are you sure you want to reset all song ratings and scores? This action cannot be undone."
                onConfirm={handleConfirmReset}
                onCancel={handleCancelReset}
                confirmText="Yes, Reset"
                cancelText="No, Keep"
                confirmButtonClass={confirmActionStyles.confirmButtonDestructive}
                isConfirming={isResetting} 
            />
        </Fragment>
    );
}
