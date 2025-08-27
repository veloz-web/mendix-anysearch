// useSearch.ts

import { RefObject, useCallback } from "react";
import { Big } from "big.js";
import { AnySearchContainerProps } from "../../typings/AnySearchProps";
import { GridWidget } from "../types/grid";
import { getConstraintValue, getBigValue, setValue } from "../utils/searchUtils";

interface UseSearchReturn {
    applySearch: () => void;
}

export function useSearch(
    props: AnySearchContainerProps,
    gridsRef: RefObject<GridWidget[]>,
    debug = false
): UseSearchReturn {
    const applySearch = useCallback(() => {
        const grids = gridsRef.current || [];
        const constraint = getConstraintValue(props.xpathAttribute);

        grids.forEach(grid => {
            try {
                const datasource = grid._datasource || grid._dataSource || grid.datasource;
                if (!datasource || typeof datasource.setConstraints !== "function") {
                    if (debug) {
                        console.debug("AnySearch: No valid datasource found");
                    }
                    return;
                }

                // Enhanced reload logic from old core.js
                const reloadCallback = (): void => {
                    // CRITICAL: Use _setSize as primary source like old core.js
                    const totalCount = datasource._setSize || datasource.totalCount || datasource._totalCount || 0;

                    if (props.countAttribute) {
                        setValue(props.countAttribute, new Big(totalCount));
                    }

                    // Update start/end attributes for pagination display
                    if (props.startAttribute && props.endAttribute) {
                        const pageSize = getBigValue(props.pagesizeAttribute, 20);
                        const offset = getBigValue(props.offsetAttribute, 0);

                        // Handle zero results like old core.js
                        if (totalCount === 0) {
                            setValue(props.startAttribute, new Big(0));
                            setValue(props.endAttribute, new Big(0));
                        } else {
                            // Normal case - calculate start/end
                            const start = Math.max(1, offset + 1);
                            const end = Math.min(offset + pageSize, totalCount);
                            setValue(props.startAttribute, new Big(start));
                            setValue(props.endAttribute, new Big(end));
                        }
                    }
                };

                // CRITICAL: Detect constraint changes like old core.js
                const constraintsChanged = datasource._constraints !== constraint;

                // Reset offset on constraint change (from old core.js)
                if (constraintsChanged && props.offsetAttribute?.value) {
                    setValue(props.offsetAttribute, new Big(0));
                }

                // Handle "wait for search" grids - critical from old core.js
                if (grid.config?.gridpresentation?.waitforsearch) {
                    if (constraint) {
                        grid._searchFilled = true;
                        datasource.setConstraints(constraint);
                    } else {
                        // Use [1=0] constraint to show empty results (from old core.js)
                        datasource.setConstraints("[1=0]");
                    }
                } else {
                    // Normal grids - set constraint (empty string clears it)
                    datasource.setConstraints(constraint);
                }

                // Apply pagination if configured
                const pageSize = getBigValue(props.pagesizeAttribute);
                if (pageSize && typeof datasource.setPageSize === "function") {
                    datasource.setPageSize(pageSize);
                }

                const offset = getBigValue(props.offsetAttribute);
                if (offset !== null && typeof datasource.setOffset === "function") {
                    datasource.setOffset(offset);
                }

                // Enhanced reload sequence from old core.js
                if (typeof grid.reload === "function") {
                    grid.reload(reloadCallback);
                } else if (typeof datasource.reload === "function") {
                    datasource.reload(reloadCallback);
                } else if (typeof grid.update === "function") {
                    grid.update(undefined, reloadCallback);
                } else if (grid.sequence && typeof grid.sequence === "function") {
                    // For older Mendix versions - exact pattern from old core.js
                    grid.sequence(["_sourceReload", "_renderData"], reloadCallback);
                } else {
                    // Fallback
                    reloadCallback();
                }

                if (debug) {
                    console.debug(`AnySearch: Applied search with constraint: "${constraint}"`);
                }
            } catch (e) {
                console.error("Error applying search:", e);
            }
        });
    }, [props, gridsRef, debug]);

    return { applySearch };
}
