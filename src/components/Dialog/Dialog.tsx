import type { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import styles from './Dialog.module.css';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ComponentChildren;
    showCloseButton?: boolean;
    ariaLabelledBy?: string; 
    ariaDescribedBy?: string; 
}

export function Dialog({
    isOpen,
    onClose,
    title,
    children,
    showCloseButton = true,
    ariaLabelledBy,
    ariaDescribedBy
}: DialogProps) {
    if (!isOpen) {
        return null;
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleDialogContentClick = (e: MouseEvent) => {
        e.stopPropagation();
    };

    const titleId = ariaLabelledBy || (title ? 'dialog-title' : undefined);

    return (
        <div
            class={styles.overlay}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={ariaDescribedBy}
        >
            <div
                class={styles.dialog}
                onClick={handleDialogContentClick}
                role="document"
            >
                {title && (
                    <div class={styles.header}>
                        <h2 id={titleId} class={styles.title}>{title}</h2>
                        {showCloseButton && (
                            <button
                                type="button"
                                class={styles.closeButton}
                                onClick={onClose}
                                aria-label="Close dialog"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                )}
                <div class={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}
