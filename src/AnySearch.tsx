// AnySearch.tsx - Main Component
import { createElement, ReactElement, useEffect, useRef } from "react";
import { AnySearchContainerProps } from "../typings/AnySearchProps";
import { useGridConnections } from "./hooks/useGridConnections";
import { useSearch } from "./hooks/useSearch";
import { GridConnectionConfig } from "./types/grid";

export function AnySearch(props: AnySearchContainerProps): ReactElement | null {
    const { targetGridName, targetGridClass, xpathAttribute, pagesizeAttribute, offsetAttribute } = props;

    const widgetRef = useRef<HTMLDivElement>(null);

    // Configure grid connections with debug enabled for troubleshooting
    const config: GridConnectionConfig = {
        targetGridClass,
        targetGridName,
        retryAttempts: 5, // Increase attempts for better discovery
        retryDelay: 300,
        debug: true // Enable debug to see what's happening
    };

    // Set up grid connections
    const { gridsRef, setupGridConnections } = useGridConnections(config, widgetRef);

    // Set up search functionality
    const { applySearch } = useSearch(props, gridsRef, config.debug);

    // Initialize grid connections on mount with delay for Mendix initialization
    useEffect(() => {
        // Add initial delay to ensure Mendix has fully initialized
        const initTimer = setTimeout(() => {
            setupGridConnections();
        }, 100);

        return () => clearTimeout(initTimer);
    }, [setupGridConnections]);

    // Watch for changes in xpath attribute and apply search
    useEffect(() => {
        if (xpathAttribute?.status === "available") {
            applySearch();
        }
    }, [xpathAttribute?.value, xpathAttribute?.status, applySearch]);

    // Also trigger search when pagination attributes change
    useEffect(() => {
        if (
            xpathAttribute?.status === "available" &&
            (pagesizeAttribute?.status === "available" || offsetAttribute?.status === "available")
        ) {
            applySearch();
        }
    }, [
        pagesizeAttribute?.value,
        offsetAttribute?.value,
        pagesizeAttribute?.status,
        offsetAttribute?.status,
        xpathAttribute?.status,
        applySearch
    ]);

    // Return a minimal but visible element that Mendix can discover
    // This is critical for Mendix to properly initialize the widget
    return (
        <div
            ref={widgetRef}
            className="widget-anysearch"
            style={{
                position: "absolute",
                width: "1px",
                height: "1px",
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap"
            }}
            aria-hidden="true"
        >
            AnySearch Active
        </div>
    );
}
