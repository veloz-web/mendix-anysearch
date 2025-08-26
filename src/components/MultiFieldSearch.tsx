import React, { ChangeEvent, useState, useEffect } from 'react';
import classNames from 'classnames';

interface XPathAttribute {
    value: string;
    setValue: (value: string) => void;
}

interface SearchAttribute {
    searchAttributeParam: string;
    searchMethodParam: string;
}

interface MultiFieldSearchProps {
    xpathAttribute: XPathAttribute;
    searchAttributes?: SearchAttribute[];
    minCharacters?: number;
    placeholderText?: string;
    renderAsTextarea?: boolean;
    textareaRows?: number;
    allowOrConditions?: boolean;
    splitString?: string;
    debug?: boolean;
}

const DEBOUNCE_DELAY = 300;

export function MultiFieldSearch({
    xpathAttribute,
    searchAttributes = [],
    minCharacters = 0,
    placeholderText,
    renderAsTextarea,
    textareaRows,
    allowOrConditions,
    splitString,
    debug = false,
}: MultiFieldSearchProps): React.ReactElement {
    const [searchValue, setSearchValue] = useState<string>('');
    const [debouncedValue, setDebouncedValue] = useState<string>('');

    // Debounce input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(searchValue);
        }, DEBOUNCE_DELAY);
        return () => clearTimeout(handler);
    }, [searchValue]);

    // XPath generation
    useEffect(() => {
        if (!xpathAttribute?.setValue || !Array.isArray(searchAttributes)) return;

        const trimmedValue = debouncedValue.trim();
        if (trimmedValue.length < minCharacters) {
            if (xpathAttribute.value !== '') {
                xpathAttribute.setValue('');
                if (debug) {
                    console.log('MultiFieldSearch: Cleared XPath due to minCharacters');
                }
            }
            return;
        }

        const searchTerms =
            allowOrConditions && splitString
                ? trimmedValue
                      .split(splitString)
                      .map((term) => term.trim())
                      .filter(Boolean)
                : [trimmedValue];

        const escapeXPath = (str: string): string => str.replace(/'/g, "''");

        const attributeConditions = searchAttributes
            .filter((attr) => attr?.searchAttributeParam && attr?.searchMethodParam)
            .map((attr) => {
                const path = attr.searchAttributeParam;
                const method = attr.searchMethodParam;
                const termConditions = searchTerms.map(
                    (term) => `${method}(${path}, '${escapeXPath(term)}')`,
                );
                return `(${termConditions.join(' or ')})`;
            });

        const finalXPath =
            attributeConditions.length > 0 ? `[${attributeConditions.join(' or ')}]` : '';

        if (xpathAttribute.value !== finalXPath) {
            xpathAttribute.setValue(finalXPath);
            if (debug) {
                console.log('MultiFieldSearch: Updated XPath:', finalXPath);
            }
        }
    }, [
        debouncedValue,
        xpathAttribute,
        searchAttributes,
        minCharacters,
        allowOrConditions,
        splitString,
        debug,
    ]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSearchValue(e.target.value);
    };

    const handleClear = () => {
        setSearchValue('');
    };

    const showClearButton = searchValue.length > 0;
    const InputComponent = renderAsTextarea ? 'textarea' : 'input';

    return (
        <div className="grid-search-multifield form-group" role="search">
            <label htmlFor="multi-search-input" className="sr-only">
                Search across multiple fields
            </label>
            <div className="control-input">
                <InputComponent
                    id="multi-search-input"
                    className="form-control"
                    type={renderAsTextarea ? undefined : 'text'}
                    placeholder={placeholderText || 'Search...'}
                    value={searchValue}
                    onChange={handleChange}
                    rows={renderAsTextarea ? textareaRows : undefined}
                    aria-label="Multi-field search input"
                />
                <span
                    className={classNames('clear-button', { visible: showClearButton })}
                    onClick={handleClear}
                    role="button"
                    aria-label="Clear search input"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            handleClear();
                        }
                    }}
                >
                    &times;
                </span>
            </div>
        </div>
    );
}
