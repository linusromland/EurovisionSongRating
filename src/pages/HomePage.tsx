import { Fragment } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import type { Song, EloRatings } from '../types';
import { initialSongsData, K_FACTOR, INITIAL_ELO } from '../data/songData';
import { calculateExpectedScore } from '../utils/elo';
import { BattleZone } from '../components/BattleZone/BattleZone';
import { Scoreboard } from '../components/Scoreboard/Scoreboard';
import { ConfirmAction } from '../components/ConfirmAction/ConfirmAction';
import { ShareScoreboardDialog } from '../components/ShareScoreboardDialog/ShareScoreboardDialog';
import confirmActionStyles from '../components/ConfirmAction/ConfirmAction.module.css';

export function HomePage() {
    const [eloRatings, setEloRatings] = useState<EloRatings>({});
    const [currentPair, setCurrentPair] = useState<[Song | null, Song | null]>([null, null]);
    const [isLoading, setIsLoading] = useState(true);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

    useEffect(() => {
        setAllSongs(initialSongsData);
        const loadedRatingsRaw = localStorage.getItem('eurovisionEloRatings');
        const loadedRatings = loadedRatingsRaw ? JSON.parse(loadedRatingsRaw) : {};
        const initialRatings: EloRatings = {};
        initialSongsData.forEach(song => {
            initialRatings[song.id] = loadedRatings[song.id] || {
                elo: INITIAL_ELO,
                numberOfVotes: 0,
            };
        });
        setEloRatings(initialRatings);
        setIsLoading(false);
    }, []);

    const selectNewPair = useCallback(() => {
        if (allSongs.length < 2) {
            setCurrentPair([null, null]);
            return;
        }

        const filteredSongs = allSongs.sort((a, b) => {
            const aVotes = eloRatings[a.id]?.numberOfVotes || 0;
            const bVotes = eloRatings[b.id]?.numberOfVotes || 0;
            return bVotes - aVotes;
        }).slice(Math.floor(allSongs.length / 2));

        let songAIndex = -1, songBIndex = -1;
        let attempts = 0;
        const maxAttempts = filteredSongs.length * (filteredSongs.length - 1);
        const [prevSongA, prevSongB] = currentPair;

        do {
            songAIndex = Math.floor(Math.random() * filteredSongs.length);
            songBIndex = Math.floor(Math.random() * filteredSongs.length);
            attempts++;
            if (filteredSongs.length > 2 && prevSongA && prevSongB && attempts < maxAttempts / 2) {
                const currentSelectionIdA = filteredSongs[songAIndex].id;
                const currentSelectionIdB = filteredSongs[songBIndex].id;
                if ((currentSelectionIdA === prevSongA.id && currentSelectionIdB === prevSongB.id) ||
                    (currentSelectionIdA === prevSongB.id && currentSelectionIdB === prevSongA.id)) {
                    continue;
                }
            }
        } while (songAIndex === songBIndex && attempts < maxAttempts);

        if (songAIndex === songBIndex && filteredSongs.length > 1) {
            songBIndex = (songAIndex + 1) % filteredSongs.length;
        } else if (songAIndex === songBIndex && filteredSongs.length === 1) {
            setCurrentPair([filteredSongs[0], null]);
            return;
        }
        setCurrentPair([filteredSongs[songAIndex], filteredSongs[songBIndex]]);
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
            const winnerRating = prevRatings[winnerId]?.elo || INITIAL_ELO;
            const loserRating = prevRatings[loserId]?.elo || INITIAL_ELO;
            const expectedWinner = calculateExpectedScore(winnerRating, loserRating);
            const newWinnerRating = winnerRating + K_FACTOR * (1 - expectedWinner);
            const newLoserRating = loserRating + K_FACTOR * (0 - (1 - expectedWinner));
            return { ...prevRatings, [winnerId]: { elo: newWinnerRating, numberOfVotes: (prevRatings[winnerId]?.numberOfVotes || 0) + 1 }, [loserId]: { elo: newLoserRating, numberOfVotes: (prevRatings[loserId]?.numberOfVotes || 0) + 1 } };
        });
        setCurrentPair([null, null]);
    }, [setCurrentPair]);

    const openResetDialog = () => setIsResetConfirmOpen(true);
    const handleCancelReset = () => setIsResetConfirmOpen(false);

    const openShareDialog = () => setIsShareDialogOpen(true);
    const closeShareDialog = () => setIsShareDialogOpen(false);

    const handleConfirmReset = useCallback(async () => {
        setIsResetting(true);

        const resetRatings: EloRatings = {};
        allSongs.forEach(song => {
            resetRatings[song.id] = {
                elo: INITIAL_ELO,
                numberOfVotes: 0,
            };
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
                <div class="error-message">Not enough songs. Add at least two in `src/data/songData.ts`.</div>
            </div>
        );
    }

    const [songA, songB] = currentPair;

    return (
        <Fragment>
            {(songA && songB) ? (
                <BattleZone songA={songA} songB={songB} onVote={handleVote} />
            ) : (
                allSongs.length >= 2 && <div class="loading-message">Selecting next pair...</div>
            )}

            <Scoreboard songs={allSongs} eloRatings={eloRatings} shareScoreboard={openShareDialog} clearScoreboard={openResetDialog} />

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

            <ShareScoreboardDialog
                isOpen={isShareDialogOpen}
                onClose={closeShareDialog}
                eloRatings={eloRatings}
            />
        </Fragment>
    );
}
