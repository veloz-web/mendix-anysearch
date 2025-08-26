/**
 * @file GridSearch.editorConfig.js
 * @description Controls conditional visibility of property groups in Mendix Studio Pro.
 */

export function getProperties(values, defaultProperties) {
    const visibleGroupsByType = {
        multifield: ['Helper Object Attribute', 'Text Search Settings'],
        button: ['Helper Object Attribute', 'Button Filter Settings'],
        dropdownStatic: [
            'Helper Object Attribute',
            'Static Dropdown Settings',
            'Button Filter Settings', // Temporarily reused for searchOptions
        ],
        localCheckbox: ['Helper Object Attribute', 'Local Checkbox Settings'],
        resetButton: ['Reset Button Settings'],
        anysearch: ['Helper Object Attribute', 'Filter Applicator Settings'],
    };

    const visibleGroups = visibleGroupsByType[values.filterType] || [];

    // Validate that all requested captions exist in defaultProperties
    const availableCaptions = new Set(defaultProperties.map((p) => p.caption));
    const unknownCaptions = visibleGroups.filter((caption) => !availableCaptions.has(caption));

    if (unknownCaptions.length > 0) {
        console.warn(
            `GridSearch.editorConfig: The following group captions are not defined in defaultProperties: ${unknownCaptions.join(
                ', ',
            )}`,
        );
        // Optional: throw instead of warn
        // throw new Error(`Invalid group captions: ${unknownCaptions.join(', ')}`);
    }

    for (const group of defaultProperties) {
        group.hidden = !visibleGroups.includes(group.caption);
    }

    return defaultProperties;
}
