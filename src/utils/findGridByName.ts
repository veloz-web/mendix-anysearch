// utils/findGridByName.ts
export function findGridByName(name: string): Promise<HTMLElement | any> {
    return new Promise((resolve, reject) => {
        if (!name) {
            reject(new Error('No grid name provided'));
            return;
        }

        const selector = `.mx-name-${name}`;
        const maxAttempts = 10;
        const delayMs = 200;
        let attempt = 0;

        const tryFind = () => {
            const el = document.querySelector(selector);
            if (el) {
                const widgetId = el.getAttribute('data-mendix-id') || el.id;
                if (widgetId && window.mx?.ui?.getWidget) {
                    try {
                        const widget = window.mx.ui.getWidget(widgetId);
                        resolve(widget || el);
                        return;
                    } catch {
                        resolve(el);
                        return;
                    }
                }
                resolve(el);
                return;
            }

            attempt += 1;
            if (attempt >= maxAttempts) {
                reject(new Error(`Grid "${name}" not found after ${maxAttempts} attempts`));
                return;
            }
            setTimeout(tryFind, delayMs);
        };

        tryFind();
    });
}
