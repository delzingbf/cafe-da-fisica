import { useEffect, useRef, type ReactNode } from 'react';
import './styles/Dialog.css';

export interface DialogProps {
    /** Called when the dialog closes itself: Esc or a click on the backdrop. */
    onClose?: () => void;
    /** Id of the element that names the dialog (usually its heading). */
    labelledBy: string;
    /** `center` for a pop-up, `start`/`end` for a side panel on the left/right. */
    placement?: 'center' | 'start' | 'end';
    /** `false` ignores Esc and backdrop clicks: the dialog stays until the page unmounts it. */
    dismissible?: boolean;
    /** `strong` blurs the page behind almost beyond recognition (e.g. the admin login). */
    backdrop?: 'normal' | 'strong';
    /** Class of the panel inside the dialog, which owns its look. */
    className?: string;
    children: ReactNode;
}

// Native modal <dialog>: the browser handles Esc, focus trapping and restoring, and the top layer.
// Render it only while it should be open; it opens itself on mount.
export function Dialog({
    onClose,
    labelledBy,
    placement = 'center',
    dismissible = true,
    backdrop = 'normal',
    className,
    children,
}: DialogProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    const classes = ['dialog', `dialog--${placement}`];
    if (backdrop === 'strong') classes.push('dialog--backdrop-strong');

    return (
        <dialog
            ref={ref}
            className={classes.join(' ')}
            aria-labelledby={labelledBy}
            onClose={onClose}
            // Chrome lets a second Esc in a row close the dialog even if `cancel` is prevented,
            // so the key itself is blocked too.
            onKeyDown={(event) => {
                if (!dismissible && event.key === 'Escape') event.preventDefault();
            }}
            onCancel={(event) => {
                if (!dismissible) event.preventDefault();
            }}
            onClick={(event) => {
                // The panel fills the <dialog>, so a click on the element itself hit the backdrop.
                if (dismissible && event.target === event.currentTarget) {
                    event.currentTarget.close();
                }
            }}
        >
            <div className={className}>{children}</div>
        </dialog>
    );
}
