// hooks/useGridConnections.ts
import { RefObject, useCallback, useRef } from "react";
import { GridWidget, GridConnectionConfig, UseGridConnectionsReturn } from "../types/grid";
import { GRID_CONNECTION_CONSTANTS } from "../constants/grid";
import {
    getWidgetFromNode,
    getWidgetId,
    getWidgetFromMendix,
    buildGridSelector,
    GridConnectionError
} from "../utils/gridUtils";
import { GridLogger } from "../utils/logger";

export function useGridConnections(
    config: GridConnectionConfig,
    widgetRef: RefObject<HTMLDivElement>
): UseGridConnectionsReturn {
    const gridsRef = useRef<GridWidget[]>([]);
    const logger = new GridLogger(config.debug);

    const connectGrid = useCallback(
        (node: Element): void => {
            try {
                let widget = getWidgetFromNode(node);

                if (!widget) {
                    const widgetId = getWidgetId(node);

                    if (!widgetId) {
                        logger.debug("Found a potential grid node, but could not find a widget ID.", node);
                        return;
                    }

                    logger.debug(
                        `Found widget ID "${widgetId}" ${
                            node !== node.closest("[data-mendix-id]") ? "on a parent element" : ""
                        }.`
                    );

                    widget = getWidgetFromMendix(widgetId);

                    if (!widget) {
                        logger.debug(`Widget with ID ${widgetId} not found in Mendix registry.`);
                        return;
                    }
                }

                if (!gridsRef.current.includes(widget)) {
                    gridsRef.current.push(widget);
                    logger.debug("Successfully connected to grid widget:", widget);
                }
            } catch (error) {
                if (error instanceof GridConnectionError) {
                    logger.debug(error.message);
                } else {
                    logger.error("Error connecting to grid:", error);
                }
            }
        },
        [logger]
    );

    const setupGridConnections = useCallback((): void => {
        const { targetGridClass, targetGridName, retryAttempts, retryDelay } = config;

        logger.debug(`Initializing grid connection with class="${targetGridClass}" and name="${targetGridName}"`);

        const selector = buildGridSelector(targetGridClass, targetGridName);

        if (!selector) {
            logger.debug("No target grid class or name provided.");
            return;
        }

        gridsRef.current = [];

        const attemptConnection = (attempt = 1): void => {
            // Search more broadly - not just within the widget's page
            const searchRoot = widgetRef.current?.closest(".mx-page") || document;
            const nodes = searchRoot.querySelectorAll(selector);

            logger.debug(`Attempt ${attempt} - Found ${nodes.length} nodes using selector "${selector}"`);

            // Also log what nodes we found for debugging
            if (nodes.length > 0) {
                logger.debug(
                    "Found nodes:",
                    Array.from(nodes).map(n => ({
                        tagName: n.tagName,
                        className: n.className,
                        id: n.id,
                        "data-mendix-id": n.getAttribute("data-mendix-id")
                    }))
                );
            }

            nodes.forEach(connectGrid);

            if (gridsRef.current.length === 0 && attempt < retryAttempts) {
                setTimeout(() => attemptConnection(attempt + 1), retryDelay);
            } else {
                logger.debug(
                    `${attempt >= retryAttempts ? "Finished all connection attempts. " : ""}Successfully connected to ${
                        gridsRef.current.length
                    } grid(s).`
                );

                // Log the connected grids for debugging
                if (gridsRef.current.length > 0) {
                    logger.debug(
                        "Connected grids:",
                        gridsRef.current.map(g => ({
                            id: g.id,
                            mxObjectType: g.mxObjectType,
                            datasource: !!g._datasource || !!g._dataSource || !!g.datasource
                        }))
                    );
                }
            }
        };

        setTimeout(() => attemptConnection(), GRID_CONNECTION_CONSTANTS.INITIAL_LOAD_DELAY_MS);
    }, [config, connectGrid, logger, widgetRef]);

    return { gridsRef, setupGridConnections };
}
