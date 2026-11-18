import { useId, type ReactNode } from 'react';
import { Dialog } from './Dialog';
import './styles/ConfirmDialog.css';

export interface ConfirmDialogProps {
    title: string;
    /** What will happen, e.g. "Remover "Brownie" do cardápio?". */
    children: ReactNode;
    /** Text of the confirm button, e.g. "Remover". */
    confirmLabel: string;
    /** While true the buttons are disabled and the dialog cannot be dismissed (the action is running). */
    busy?: boolean;
    /** Shown above the buttons when the action failed. */
    error?: string | null;
    onConfirm: () => void;
    onCancel: () => void;
}

/** "Are you sure?" pop-up. Render it only while open; the parent runs the action in `onConfirm`. */
export function ConfirmDialog({
    title,
    children,
    confirmLabel,
    busy = false,
    error,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const titleId = useId();

    return (
        <Dialog
            labelledBy={titleId}
            dismissible={!busy}
            onClose={onCancel}
            className="confirm-dialog"
        >
            <h2 id={titleId}>{title}</h2>
            <div className="confirm-dialog__message">{children}</div>

            {error && (
                <p className="confirm-dialog__error" role="alert">
                    {error}
                </p>
            )}

            <div className="confirm-dialog__actions">
                <button
                    type="button"
                    className="confirm-dialog__cancel"
                    disabled={busy}
                    onClick={onCancel}
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    className="confirm-dialog__confirm"
                    disabled={busy}
                    onClick={onConfirm}
                >
                    {busy ? 'Aguarde…' : confirmLabel}
                </button>
            </div>
        </Dialog>
    );
}
