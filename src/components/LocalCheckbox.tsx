import { useState, useEffect, useMemo, ChangeEvent, JSX } from 'react';

interface XPathAttribute {
    value: string;
    setValue: (value: string) => void;
}

interface Formatter {
    format?: (key: string) => string;
}

interface SearchAttribute {
    id: string;
    type: 'Boolean' | 'Enum' | string;
    universe?: string[];
    formatter?: Formatter;
}

interface EnumValue {
    key: string;
    caption: string;
}

interface LocalCheckboxProps {
    searchAttribute: SearchAttribute;
    xpathAttribute: XPathAttribute;
    booleanCaption?: string;
    debug?: boolean;
}

export function LocalCheckbox({
    searchAttribute,
    xpathAttribute,
    booleanCaption,
    debug = false,
}: LocalCheckboxProps): JSX.Element | null {
    const [attributeType, setAttributeType] = useState<'Enum' | 'Boolean' | null>(null);
    const [enumValues, setEnumValues] = useState<EnumValue[]>([]);
    const [selectedEnumKeys, setSelectedEnumKeys] = useState<string[]>([]);
    const [isBooleanChecked, setIsBooleanChecked] = useState<boolean>(false);

    const attributeName = useMemo(() => searchAttribute?.id, [searchAttribute]);

    useEffect(() => {
        if (!attributeName || !xpathAttribute) return;

        const metadata = searchAttribute.universe;
        const formatter = searchAttribute.formatter;

        if (Array.isArray(metadata)) {
            setAttributeType('Enum');
            const values = metadata.map((key) => ({
                key,
                caption: formatter?.format ? formatter.format(key) : key,
            }));
            setEnumValues(values);
        } else if (searchAttribute.type === 'Boolean') {
            setAttributeType('Boolean');
        } else {
            console.error('LocalCheckbox: Unsupported attribute type:', searchAttribute.type);
        }
    }, [attributeName, searchAttribute, xpathAttribute]);

    useEffect(() => {
        if (!xpathAttribute?.setValue || !attributeName) return;

        let newXPath = '';

        if (attributeType === 'Enum' && selectedEnumKeys.length > 0) {
            const conditions = selectedEnumKeys
                .map((key) => `${attributeName} = '${key}'`)
                .join(' or ');
            newXPath = `[${conditions}]`;
        } else if (attributeType === 'Boolean' && isBooleanChecked) {
            newXPath = `[${attributeName} = true()]`;
        }

        if (xpathAttribute.value !== newXPath) {
            xpathAttribute.setValue(newXPath);
            if (debug) {
                console.log('LocalCheckbox: Updated XPath:', newXPath);
            }
        }
    }, [selectedEnumKeys, isBooleanChecked, attributeType, attributeName, xpathAttribute, debug]);

    const handleEnumChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        setSelectedEnumKeys((prev) =>
            checked ? [...prev, value] : prev.filter((key) => key !== value),
        );
    };

    const handleBooleanChange = (event: ChangeEvent<HTMLInputElement>) => {
        setIsBooleanChecked(event.target.checked);
    };

    if (!attributeType) return null;

    return (
        <fieldset className="grid-search-local-checkbox">
            <legend>{attributeType === 'Enum' ? 'Select options' : 'Toggle value'}</legend>

            {attributeType === 'Enum' &&
                enumValues.map(({ key, caption }) => {
                    const isChecked = selectedEnumKeys.includes(key);
                    return (
                        <div
                            key={key}
                            className="checkbox"
                            role="checkbox"
                            aria-checked={isChecked}
                        >
                            <label>
                                <input
                                    type="checkbox"
                                    value={key}
                                    checked={isChecked}
                                    onChange={handleEnumChange}
                                    aria-label={`Filter by ${caption}`}
                                />
                                {caption}
                            </label>
                        </div>
                    );
                })}

            {attributeType === 'Boolean' && (
                <div className="checkbox" role="checkbox" aria-checked={isBooleanChecked}>
                    <label>
                        <input
                            type="checkbox"
                            checked={isBooleanChecked}
                            onChange={handleBooleanChange}
                            aria-label={`Toggle ${booleanCaption || attributeName}`}
                        />
                        {booleanCaption || attributeName}
                    </label>
                </div>
            )}
        </fieldset>
    );
}
