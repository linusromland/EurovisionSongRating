import type { Song } from '../../types';
import { getYoutubeEmbedUrl } from '../../utils/youtube';
import styles from './SongCard.module.css';

interface SongCardProps {
    song?: Song | null;
    onVote: () => void;
    isSongA: boolean;
}

export function SongCard({ song, onVote, isSongA }: SongCardProps) {
    if (!song) return null;

    const cardClasses = [styles.songCard];

    const voteButtonClasses = [styles.voteButton];
    if (isSongA) {
        voteButtonClasses.push(styles.voteButtonSongA);
    }

    const embedUrl = getYoutubeEmbedUrl(song.youtubeUrl);

    return (
        <div class={cardClasses.join(' ')}>
            <div class={styles.songCardContent}>
                <h2><span class={styles.countryFlag}>{song.flag}</span> {song.country}</h2>
                <p class={styles.songTitle}>{song.song}</p>
                <p class={styles.artistName}>{song.artist}</p>
                {embedUrl ? (
                    <iframe
                        class={styles.youtubeEmbed}
                        src={embedUrl}
                        title={`YouTube video player for ${song.song}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <p class={styles.embedError}>Video not available</p>
                )}
            </div>
            <button class={voteButtonClasses.join(' ')} onClick={onVote}>
                Vote for this song!
            </button>
        </div>
    );
}