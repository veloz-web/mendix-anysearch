import { useState, useEffect, useMemo, ChangeEvent, JSX } from 'react';

interface XPathAttribute {
    value?: string;
    setValue: (value: string) => void;
}

interface SearchOption {
    optionLabel: string;
    optionXPath: string;
    isDefault?: boolean;
}

interface StaticDropdownProps {
    searchOptions?: SearchOption[];
    xpathAttribute: XPathAttribute;
    blankOptionLabel?: string;
    debug?: boolean;
}

export function StaticDropdown({
    searchOptions = [],
    xpathAttribute,
    blankOptionLabel,
    debug = false,
}: StaticDropdownProps): JSX.Element {
    const validOptions = useMemo(() => {
        return Array.isArray(searchOptions)
            ? searchOptions.filter((opt) => opt && typeof opt.optionXPath === 'string')
            : [];
    }, [searchOptions]);

    const defaultOptionIndex = useMemo(() => {
        const defaultIdx = validOptions.findIndex((opt) => opt.isDefault);
        return defaultIdx !== -1 ? (defaultIdx + 1).toString() : '';
    }, [validOptions]);

    const [selectedIndex, setSelectedIndex] = useState<string>(defaultOptionIndex);

    useEffect(() => {
        if (!xpathAttribute?.setValue) return;

        let newXPath = '';
        if (selectedIndex !== '') {
            const optionIdx = parseInt(selectedIndex, 10) - 1;
            const selectedOption = validOptions[optionIdx];
            newXPath = selectedOption?.optionXPath || '';
        }

        if (xpathAttribute.value !== newXPath) {
            xpathAttribute.setValue(newXPath);
            if (debug) {
                console.log('StaticDropdown: Updated XPath:', newXPath);
            }
        }
    }, [selectedIndex, validOptions, xpathAttribute, debug]);

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedIndex(event.target.value);
    };

    return (
        <div className="grid-search-static-dropdown">
            <label htmlFor="static-dropdown-select" className="sr-only">
                Filter Options
            </label>
            <select
                id="static-dropdown-select"
                className="form-control"
                value={selectedIndex}
                onChange={handleChange}
                aria-label="Static filter dropdown"
                disabled={!validOptions.length}
            >
                <option value="">{blankOptionLabel || '(None)'}</option>
                {validOptions.map((option, index) => (
                    <option key={option.optionXPath} value={index + 1}>
                        {option.optionLabel}
                    </option>
                ))}
            </select>
        </div>
    );
}
