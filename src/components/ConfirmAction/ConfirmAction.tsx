import { Dialog } from '../Dialog/Dialog';
import styles from './ConfirmAction.module.css';

interface ConfirmActionProps {
    isOpen: boolean;
    title: string;
    message: string | preact.ComponentChildren;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClass?: string;
    isConfirming?: boolean;
}

export function ConfirmAction({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmButtonClass = styles.confirmButtonDefault,
    isConfirming = false
}: ConfirmActionProps) {
    if (!isOpen) {
        return null;
    }

    const messageId = 'confirm-action-message';

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onCancel}
            title={title}
            showCloseButton={true}
            ariaLabelledBy="Confirm Action"
            ariaDescribedBy={messageId}
        >
            <div >
                <p id={messageId} class={styles.message}>
                    {message}
                </p>
                <div class={styles.actions}>
                    <button
                        type="button"
                        class={`${styles.button} ${styles.cancelButton}`}
                        onClick={onCancel}
                        disabled={isConfirming}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        class={`${styles.button} ${confirmButtonClass}`}
                        onClick={onConfirm}
                        disabled={isConfirming}
                    >
                        {isConfirming ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
