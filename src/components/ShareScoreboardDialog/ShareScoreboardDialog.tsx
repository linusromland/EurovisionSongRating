import { useState, useCallback } from 'preact/hooks';
import { Dialog } from '../Dialog/Dialog';
import type { EloRatings } from '../../types';
import styles from './ShareScoreboardDialog.module.css';

interface ShareScoreboardDialogProps {
    isOpen: boolean;
    onClose: () => void;
    eloRatings: EloRatings;
}

const generateShareLink = (name: string, ratings: EloRatings): string => {
    const sanitizedName = name.replace(/[^a-zA-Z0-9 ]/g, '');

    const sanitizedRatings: EloRatings = {}
    Object.entries(ratings).map(([key, value]) => {
        const newPayload = {
            numberOfVotes: value.numberOfVotes || 0,
            elo: Math.round((value.elo || 0) * 100) / 100,
        }

        sanitizedRatings[key] = newPayload;
    });

    const base64Payload = btoa(JSON.stringify({ name: sanitizedName, ratings: sanitizedRatings }));

    const baseUrl = window.location.origin;

    return `${baseUrl}/scoreboard?data=${base64Payload}`;
};

export function ShareScoreboardDialog({
    isOpen,
    onClose,
    eloRatings
}: ShareScoreboardDialogProps) {
    const [scoreboardName, setScoreboardName] = useState<string>('');
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [hasCopied, setHasCopied] = useState<boolean>(false);

    const handleNameChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        setScoreboardName(target.value);
    };

    const handleGenerateLink = useCallback(async () => {
        if (!scoreboardName.trim()) {
            alert("Please enter a name for your scoreboard share.");
            return;
        }
        setIsGenerating(true);
        const link = generateShareLink(scoreboardName, eloRatings);
        setGeneratedLink(link);
        setIsGenerating(false);
        setHasCopied(false);
    }, [scoreboardName, eloRatings]);

    const handleCopyLink = useCallback(() => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink)
                .then(() => {
                    setHasCopied(true);
                    setTimeout(() => setHasCopied(false), 2000);
                })
                .catch(err => {
                    console.error('Failed to copy link: ', err);
                });
        }
    }, [generatedLink]);

    const resetDialogState = () => {
        setScoreboardName('');
        setGeneratedLink(null);
        setIsGenerating(false);
        setHasCopied(false);
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={resetDialogState}
            title={generatedLink ? "Shareable Link Generated!" : "Share Your Scoreboard"}
            showCloseButton={true}
        >
            {!generatedLink ? (
                <div class={styles.shareContent}>
                    <p class={styles.instructions}>
                        Give your scoreboard share a name to generate a unique link.
                    </p>
                    <div class={styles.inputGroup}>
                        <label htmlFor="scoreboardNameInput" class={styles.label}>
                            Share Name:
                        </label>
                        <input
                            type="text"
                            id="scoreboardNameInput"
                            class={styles.inputField}
                            value={scoreboardName}
                            onInput={handleNameChange}
                            placeholder="E.g., My Eurovision Top 10"
                            disabled={isGenerating}
                        />
                    </div>
                    <div class={styles.actions}>
                        <button
                            type="button"
                            class={`${styles.button} ${styles.cancelButton}`}
                            onClick={resetDialogState}
                            disabled={isGenerating}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            class={`${styles.button} ${styles.primaryButton}`}
                            onClick={handleGenerateLink}
                            disabled={isGenerating || !scoreboardName.trim()}
                        >
                            {isGenerating ? 'Generating...' : 'Generate Link'}
                        </button>
                    </div>
                </div>
            ) : (
                <div class={styles.shareContent}>
                    <p class={styles.instructions}>
                        Your shareable link is ready. Copy it and send it to your friends!
                    </p>
                    <div class={styles.linkDisplayGroup}>
                        <input
                            type="text"
                            class={`${styles.inputField} ${styles.linkField}`}
                            value={generatedLink}
                            readOnly
                        />
                        <button
                            type="button"
                            class={`${styles.button} ${styles.copyButton} ${hasCopied ? styles.copied : ''}`}
                            onClick={handleCopyLink}
                        >
                            {hasCopied ? 'Copied!' : 'Copy Link'}
                        </button>
                    </div>
                    <div class={styles.actions}>
                        <button
                            type="button"
                            class={`${styles.button} ${styles.primaryButton}`}
                            onClick={() => {
                                setGeneratedLink(null);
                                setScoreboardName('');
                                setHasCopied(false);
                            }}
                        >
                            Generate New Link
                        </button>
                        <button
                            type="button"
                            class={`${styles.button} ${styles.cancelButton}`}
                            onClick={resetDialogState}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </Dialog>
    );
}
