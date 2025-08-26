import { useEffect, useState, useRef, JSX } from 'react';
import { findGridByName } from '../utils/findGridByName';

interface MendixAttribute {
    value?: string | number;
}

interface AnySearchProps {
    targetGridName?: string;
    xpathAttribute?: MendixAttribute;
    sortAttribute?: MendixAttribute;
    pagesizeAttribute?: MendixAttribute;
    offsetAttribute?: MendixAttribute;
    debug?: boolean;
}

export function AnySearch({
    targetGridName,
    xpathAttribute,
    sortAttribute,
    pagesizeAttribute,
    offsetAttribute,
    debug = false,
}: AnySearchProps): JSX.Element | null {
    const gridWidgetRef = useRef<any>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let mounted = true;

        if (!targetGridName) {
            if (debug) {
                console.error('AnySearch: targetGridName prop is required.');
            }
            setReady(true);
            return () => {
                mounted = false;
            };
        }

        findGridByName(targetGridName)
            .then((widget) => {
                if (mounted) {
                    gridWidgetRef.current = widget;
                }
            })
            .catch((err) => {
                if (debug) {
                    console.error(`AnySearch: Failed to find grid "${targetGridName}":`, err);
                }
            })
            .finally(() => {
                if (mounted) {
                    setReady(true);
                }
            });

        return () => {
            mounted = false;
        };
    }, [targetGridName, debug]);

    useEffect(() => {
        if (!ready || !gridWidgetRef.current) return;

        const gridWidget = gridWidgetRef.current;
        const datasource =
            gridWidget._datasource || gridWidget._dataSource || gridWidget.datasource || null;

        if (!datasource) {
            if (debug) {
                console.error(`AnySearch: No datasource found on grid "${targetGridName}".`);
            }
            return;
        }

        const xpath = xpathAttribute?.value ?? '';
        let sort = datasource._sorting;

        if (sortAttribute?.value) {
            try {
                sort = JSON.parse(sortAttribute.value as string);
            } catch (e) {
                if (debug) {
                    console.error('AnySearch: Failed to parse sortAttribute.value', e);
                }
            }
        }

        const pageSize = pagesizeAttribute?.value ?? datasource._pageSize;
        const offset = offsetAttribute?.value ?? datasource._offset;

        let needsReload = false;

        // Apply constraints
        try {
            if (datasource._constraints !== xpath) {
                if (typeof datasource.setConstraints === 'function') {
                    datasource.setConstraints(xpath);
                } else {
                    datasource._constraints = xpath;
                }
                needsReload = true;
            }
        } catch (e) {
            if (debug) {
                console.error('AnySearch: error applying constraints', e);
            }
        }

        // Apply sort
        try {
            const sortChanged = JSON.stringify(datasource._sorting) !== JSON.stringify(sort);
            if (sortChanged) {
                datasource._sorting = sort;
                needsReload = true;
            }
        } catch (e) {
            if (debug) {
                console.error('AnySearch: error applying sort', e);
            }
        }

        // Apply page size
        try {
            if (datasource._pageSize !== pageSize) {
                if (typeof datasource.setPageSize === 'function') {
                    datasource.setPageSize(pageSize);
                } else {
                    datasource._pageSize = pageSize;
                }
                needsReload = true;
            }
        } catch (e) {
            if (debug) {
                console.error('AnySearch: error applying pageSize', e);
            }
        }

        // Apply offset
        try {
            if (datasource._offset !== offset) {
                if (typeof datasource.setOffset === 'function') {
                    datasource.setOffset(offset);
                } else {
                    datasource._offset = offset;
                }
                needsReload = true;
            }
        } catch (e) {
            if (debug) {
                console.error('AnySearch: error applying offset', e);
            }
        }

        // Trigger reload
        if (needsReload) {
            if (debug) {
                console.debug(`AnySearch: Reloading grid "${targetGridName}"`, {
                    xpath,
                    sort,
                    pageSize,
                    offset,
                });
            }

            try {
                if (typeof gridWidget.reload === 'function') {
                    gridWidget.reload();
                } else if (typeof gridWidget.update === 'function') {
                    gridWidget.update();
                } else if (typeof datasource.reload === 'function') {
                    datasource.reload();
                } else {
                    if (debug) {
                        console.warn(
                            `AnySearch: No reload method found for grid "${targetGridName}".`,
                        );
                    }
                }
            } catch (e) {
                if (debug) {
                    console.error('AnySearch: error invoking reload/update', e);
                }
            }
        }
    }, [
        ready,
        targetGridName,
        xpathAttribute?.value,
        sortAttribute?.value,
        pagesizeAttribute?.value,
        offsetAttribute?.value,
        debug,
    ]);

    return null;
}
