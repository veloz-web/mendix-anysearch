// usePagination.ts

import { Big } from "big.js";
import { useCallback, useRef } from "react";
import { AnySearchContainerProps } from "../../typings/AnySearchProps";

// Define minimal interfaces to avoid complex imports
interface GridWidget {
    _datasource?: any;
    _dataSource?: any;
    datasource?: any;
    [key: string]: any;
}

interface UsePaginationReturn {
    applyPaginationToGrid: (grid: GridWidget) => void;
    updateCountAndPagination: (grid: GridWidget) => void;
    setupGridListeners: (grid: GridWidget) => void;
}

// Simple utility functions
function setValue<T>(attribute: any, value: T): void {
    if (attribute && attribute.status === "available" && typeof attribute.setValue === "function") {
        try {
            attribute.setValue(value);
        } catch (e) {
            console.error("setValue error:", e);
        }
    }
}

function getDatasource(grid: any): any {
    return grid?._datasource || grid?._dataSource || grid?.datasource || null;
}

function getTotalCount(datasource: any): number {
    try {
        return datasource?.getTotalCount?.() || datasource?._totalCount || datasource?.totalCount || 0;
    } catch {
        return 0;
    }
}

function getNumericValue(attribute: any, defaultValue: number): number {
    try {
        if (attribute && attribute.status === "available" && attribute.value) {
            return attribute.value instanceof Big ? attribute.value.toNumber() : Number(attribute.value);
        }
    } catch {
        // ignore
    }
    return defaultValue;
}

function callDatasourceMethod(datasource: any, methodName: string, ...args: any[]): void {
    try {
        if (datasource && typeof datasource[methodName] === "function") {
            datasource[methodName](...args);
        }
    } catch {
        // Silently ignore errors for fallback methods
    }
}

export function usePagination(props: AnySearchContainerProps, debug: boolean): UsePaginationReturn {
    const listenersSetupRef = useRef(new WeakSet<GridWidget>());

    const updateCountAndPagination = useCallback(
        (grid: GridWidget): void => {
            try {
                const ds = getDatasource(grid);
                if (!ds) {
                    if (debug) {
                        console.debug("AnySearch: No datasource found for updateCountAndPagination");
                    }
                    return;
                }

                const totalCount = getTotalCount(ds);

                if (props.countAttribute) {
                    setValue(props.countAttribute, new Big(totalCount));
                }

                const pageSize = getNumericValue(props.pagesizeAttribute, 10);
                const offset = getNumericValue(props.offsetAttribute, 0);

                const start = Math.max(1, offset + 1);
                const end = Math.min(offset + pageSize, totalCount);

                if (debug) {
                    console.debug(
                        `AnySearch: Updating pagination. Total: ${totalCount}, PageSize: ${pageSize}, Offset: ${offset}. Start: ${start}, End: ${end}.`
                    );
                }

                if (props.startAttribute) {
                    setValue(props.startAttribute, new Big(start));
                }
                if (props.endAttribute) {
                    setValue(props.endAttribute, new Big(end));
                }
            } catch (e) {
                if (debug) {
                    console.error("AnySearch: updateCountAndPagination error:", e);
                }
            }
        },
        [
            props.countAttribute,
            props.startAttribute,
            props.endAttribute,
            props.pagesizeAttribute,
            props.offsetAttribute,
            debug
        ]
    );

    const applyPaginationToGrid = useCallback(
        (grid: GridWidget) => {
            try {
                const ds = getDatasource(grid);
                if (!ds) {
                    if (debug) {
                        console.debug("AnySearch: No datasource on grid");
                    }
                    return;
                }

                const pageSize = getNumericValue(props.pagesizeAttribute, 10);
                if (debug) {
                    console.debug(`AnySearch: Applying page size of ${pageSize} to grid datasource.`);
                }
                callDatasourceMethod(ds, "setPageSize", pageSize);

                const offset = getNumericValue(props.offsetAttribute, 0);
                callDatasourceMethod(ds, "setOffset", offset);

                setTimeout(() => updateCountAndPagination(grid), 0);
            } catch (e) {
                if (debug) {
                    console.error("AnySearch: applyPaginationToGrid error:", e);
                }
            }
        },
        [props.pagesizeAttribute, props.offsetAttribute, debug, updateCountAndPagination]
    );

    const setupGridListeners = useCallback(
        (grid: GridWidget): void => {
            try {
                if (listenersSetupRef.current.has(grid)) {
                    return;
                }

                const ds = getDatasource(grid);
                if (!ds) {
                    if (debug) {
                        console.debug("AnySearch: No datasource found for setupGridListeners");
                    }
                    return;
                }

                if (debug) {
                    console.debug("AnySearch: Setting up grid listeners");
                }

                const listener = (): void => {
                    if (debug) {
                        console.debug("AnySearch: Datasource change detected");
                    }
                    updateCountAndPagination(grid);
                };

                callDatasourceMethod(ds, "addListener", "update", listener);
                callDatasourceMethod(ds, "addListener", "load", listener);
                callDatasourceMethod(ds, "addListener", "reload", listener);
                callDatasourceMethod(ds, "on", "update", listener);
                callDatasourceMethod(ds, "on", "load", listener);
                callDatasourceMethod(ds, "on", "change", listener);

                listenersSetupRef.current.add(grid);
            } catch (e) {
                if (debug) {
                    console.error("AnySearch: setupGridListeners error:", e);
                }
            }
        },
        [debug, updateCountAndPagination]
    );

    return { applyPaginationToGrid, updateCountAndPagination, setupGridListeners };
}
