// utils/gridUtils.ts
import { GridWidget } from "../types/grid";

export class GridConnectionError extends Error {
    constructor(message: string, public readonly widgetId?: string) {
        super(message);
        this.name = "GridConnectionError";
    }
}

export const getWidgetFromNode = (node: Element): GridWidget | null => {
    // Try direct widget property access
    if ("widget" in node) {
        return (node as any).widget;
    }

    if ("_widget" in node) {
        return (node as any)._widget;
    }

    return null;
};

export const getWidgetId = (node: Element): string | null => {
    let widgetId = node.getAttribute("data-mendix-id") || node.id;

    if (!widgetId) {
        const parentWithId = node.closest("[data-mendix-id]");
        if (parentWithId) {
            widgetId = parentWithId.getAttribute("data-mendix-id") ?? "";
        }
    }

    return widgetId || null;
};

export const getWidgetFromMendix = (widgetId: string): GridWidget | null => {
    if (!window.mx?.ui?.getWidget) {
        return null;
    }

    try {
        return window.mx.ui.getWidget(widgetId);
    } catch (error) {
        throw new GridConnectionError(`Could not get widget with ID ${widgetId}`, widgetId);
    }
};

export const buildGridSelector = (targetGridClass?: string, targetGridName?: string): string | null => {
    if (targetGridClass?.trim()) {
        return `.${targetGridClass.trim()}`;
    }

    if (targetGridName?.trim()) {
        return `.mx-name-${targetGridName.trim()}`;
    }

    return null;
};
