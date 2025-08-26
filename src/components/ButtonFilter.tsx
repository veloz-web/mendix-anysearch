import { useState, useEffect, useMemo, JSX } from 'react';
import classNames from 'classnames';

interface XPathAttribute {
    value: string;
    setValue: (value: string) => void;
}

interface FilterOption {
    key: string;
    optionLabel: string;
    optionXPath: string;
    isDefault?: boolean;
}

interface ButtonFilterProps {
    searchOptions?: FilterOption[];
    xpathAttribute: XPathAttribute;
    allowMultiselect?: boolean;
    multiselectBehavior?: 'or' | 'and';
    activeClass?: string;
    groupedButtons?: boolean;
    debug?: boolean;
}

export function ButtonFilter({
    searchOptions = [],
    xpathAttribute,
    allowMultiselect = false,
    multiselectBehavior = 'or',
    activeClass = 'btn-primary',
    groupedButtons = false,
    debug = false,
}: ButtonFilterProps): JSX.Element | null {
    const validOptions = useMemo(() => {
        return Array.isArray(searchOptions)
            ? searchOptions.filter((opt) => opt?.key && typeof opt.optionXPath === 'string')
            : [];
    }, [searchOptions]);

    const defaultOptions = useMemo(() => {
        const defaults = validOptions.filter((opt) => opt.isDefault);
        return allowMultiselect ? defaults : defaults.slice(0, 1);
    }, [validOptions, allowMultiselect]);

    const [activeOptions, setActiveOptions] = useState<FilterOption[]>(defaultOptions);

    useEffect(() => {
        if (!xpathAttribute?.setValue) return;

        const constraints = activeOptions
            .map((opt: any) => opt.optionXPath.replace(/^\[|\]$/g, ''))
            .filter(Boolean);

        const newXPath =
            constraints.length === 0 ? '' : `[${constraints.join(` ${multiselectBehavior} `)}]`;

        if (xpathAttribute.value !== newXPath) {
            xpathAttribute.setValue(newXPath);
            if (debug) {
                console.log('ButtonFilter: XPath updated:', newXPath);
            }
        }
    }, [activeOptions, xpathAttribute, multiselectBehavior, debug]);

    const handleButtonClick = (option: FilterOption) => {
        setActiveOptions((current) => {
            const isActive = current.some((o) => o.key === option.key);
            return isActive
                ? current.filter((o) => o.key !== option.key)
                : allowMultiselect
                ? [...current, option]
                : [option];
        });
    };

    if (!validOptions.length || !xpathAttribute) return null;

    return (
        <fieldset
            className={classNames('grid-search-button-filter', { 'btn-group': groupedButtons })}
            role="group"
            aria-label="Filter options"
        >
            <legend className="sr-only">Filter Options</legend>
            {validOptions.map((option) => {
                const isActive = activeOptions.some((o) => o.key === option.key);
                return (
                    <button
                        key={option.key}
                        type="button"
                        className={classNames('btn', 'btn-default', {
                            [activeClass]: isActive,
                        })}
                        onClick={() => handleButtonClick(option)}
                        aria-pressed={isActive}
                        aria-label={`Filter by ${option.optionLabel}`}
                    >
                        {option.optionLabel}
                    </button>
                );
            })}
        </fieldset>
    );
}
