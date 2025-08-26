import { JSX } from 'react';

interface MendixAction {
    canExecute: boolean;
    execute: () => void;
}

interface ResetButtonProps {
    onClearAction?: MendixAction;
    buttonCaption?: string;
}

export function ResetButton({
    onClearAction,
    buttonCaption = 'Reset',
}: ResetButtonProps): JSX.Element | null {
    const handleClick = () => {
        if (onClearAction?.canExecute) {
            onClearAction.execute();
        } else {
            console.warn(
                "ResetButton: The 'onClearAction' is not configured or cannot be executed.",
            );
        }
    };

    if (!onClearAction) return null;

    return (
        <div className="grid-search-reset-button">
            <button className="btn btn-default" onClick={handleClick}>
                {buttonCaption}
            </button>
        </div>
    );
}
