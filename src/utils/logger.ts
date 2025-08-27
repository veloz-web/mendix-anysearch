// utils/logger.ts
export class GridLogger {
    constructor(private debugEnabled: boolean) {}

    debug(...args: any[]): void {
        if (this.debugEnabled) {
            console.debug("AnySearch:", ...args);
        }
    }

    error(...args: any[]): void {
        if (this.debugEnabled) {
            console.error("AnySearch:", ...args);
        }
    }
}
