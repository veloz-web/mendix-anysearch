// types/mendix.d.ts
declare global {
    interface Window {
        mx?: {
            ui?: {
                getWidget?: (widgetId: string) => MendixWidget;
            };
        };
    }
}

export interface MendixWidget {
    [key: string]: any;
}

export {};
