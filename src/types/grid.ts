// types/grid.ts
import { RefObject } from "react";
import { MendixWidget } from "./mendix";

export interface GridWidget extends MendixWidget {
    // Add any grid-specific properties here if known
}

export interface GridConnectionConfig {
    targetGridClass?: string;
    targetGridName?: string;
    retryAttempts: number;
    retryDelay: number;
    debug: boolean;
}

export interface UseGridConnectionsReturn {
    gridsRef: RefObject<GridWidget[]>;
    setupGridConnections: () => void;
}
