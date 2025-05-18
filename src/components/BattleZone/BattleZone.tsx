import type { Song } from '../../types';
import { SongCard } from '../SongCard/SongCard';
import styles from './BattleZone.module.css';

interface BattleZoneProps {
    songA?: Song | null;
    songB?: Song | null;
    onVote: (winnerId: string, loserId: string) => void;
}

export function BattleZone({ songA, songB, onVote }: BattleZoneProps) {
    if (!songA || !songB) {
        return <div class="loading-message">Selecting next pair...</div>;
    }

    return (
        <section class={styles.battleZone}>
            <div class={styles.songContainer}>
                <SongCard
                    song={songA}
                    onVote={() => onVote(songA.id, songB.id)}
                    isSongA={true}
                />
            </div>
            <div class={styles.songContainer}>
                <SongCard
                    song={songB}
                    onVote={() => onVote(songB.id, songA.id)}
                    isSongA={false}
                />
            </div>
        </section>
    );
}