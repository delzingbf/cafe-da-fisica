import './styles/VeganToggleFilter.css';

type Props = {
    veganOnly: boolean;
    onVeganChange: (value: boolean) => void;
};

export function VeganToggleFilter({ veganOnly, onVeganChange }: Props) {
    return (
        <label className="vegan-toggle-filter">
            <input
                className="vegan-toggle-filter__input"
                type="checkbox"
                role="switch"
                checked={veganOnly}
                onChange={(event) => onVeganChange(event.target.checked)}
            />
            <span className="vegan-toggle-filter__track" aria-hidden="true" />
            <span>Vegano</span>
        </label>
    );
}
