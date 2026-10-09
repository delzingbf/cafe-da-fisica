import { useEffect, useRef, type ReactNode } from 'react';
import './styles/Dialog.css';

export interface DialogProps {
    /** Called when the dialog closes itself: Esc or a click on the backdrop. */
    onClose: () => void;
    /** Id of the element that names the dialog (usually its heading). */
    labelledBy: string;
    /** `center` for a pop-up, `end` for a side panel. */
    placement?: 'center' | 'end';
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
    className,
    children,
}: DialogProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    return (
        <dialog
            ref={ref}
            className={`dialog dialog--${placement}`}
            aria-labelledby={labelledBy}
            onClose={onClose}
            onClick={(event) => {
                // The panel fills the <dialog>, so a click on the element itself hit the backdrop.
                if (event.target === event.currentTarget) event.currentTarget.close();
            }}
        >
            <div className={className}>{children}</div>
        </dialog>
    );
}
