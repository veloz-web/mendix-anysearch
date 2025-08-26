/**
 * @file gridUtils.js
 * @description Advanced utility for locating Mendix Data Grid widgets with resilience and extensibility.
 */

/* global setTimeout */

const DEFAULT_MAX_RETRIES = 10;
const DEFAULT_RETRY_DELAY = 500;

/**
 * Safely access Mendix widget by ID using modern API.
 * @param {string} mendixId
 * @returns {object|null}
 */
function safeGetWidget(mendixId) {
    try {
        return typeof window.mx?.ui?.get === 'function' ? window.mx.ui.get(mendixId) : null;
    } catch (err) {
        console.warn('GridSearch: mx.ui.get threw an error:', err);
        return null;
    }
}

/**
 * Determines if a widget is a Data Grid (legacy or modern).
 * @param {object} widget
 * @returns {boolean}
 */
function isDataGridWidget(widget) {
    if (!widget) {
        return false;
    }
    const type = widget?.declaredClass || widget?.__proto__?.constructor?.name;
    return typeof type === 'string' && /datagrid/i.test(type);
}

/**
 * Finds a Mendix Data Grid widget instance by name.
 *
 * @param {string} gridName - The name of the grid widget from Mendix Studio Pro.
 * @param {object} [options]
 * @param {number} [options.maxRetries=10]
 * @param {number} [options.retryDelay=500]
 * @param {boolean} [options.debug=false]
 * @param {AbortSignal} [options.signal] - Optional abort signal.
 * @param {(widget: object) => void} [options.onFound] - Optional callback when widget is found.
 * @returns {Promise<object>}
 */
export function findGridByNameAdvanced(gridName, options = {}) {
    const {
        maxRetries = DEFAULT_MAX_RETRIES,
        retryDelay = DEFAULT_RETRY_DELAY,
        debug = false,
        signal,
        onFound,
    } = options;

    if (typeof gridName !== 'string' || gridName.trim() === '') {
        return Promise.reject(new Error('GridSearch: gridName must be a non-empty string.'));
    }

    if (signal?.aborted) {
        return Promise.reject(new Error('GridSearch: Search aborted before starting.'));
    }

    return new Promise((resolve, reject) => {
        let attempts = 0;

        function attemptFind() {
            if (signal?.aborted) {
                reject(new Error('GridSearch: Search aborted.'));
                return;
            }

            attempts++;
            const selector = `.mx-name-${gridName}`;
            const gridNode = document.querySelector(selector);

            if (debug) {
                console.log(
                    `GridSearch: Attempt ${attempts} for "${gridName}" using selector "${selector}"`,
                );
            }

            if (gridNode) {
                const mendixId = gridNode.getAttribute('data-mendix-id');
                const widget = mendixId ? safeGetWidget(mendixId) : null;

                if (widget) {
                    if (!isDataGridWidget(widget)) {
                        console.warn(
                            `GridSearch: Widget "${gridName}" found but may not be a Data Grid.`,
                        );
                    }

                    if (typeof onFound === 'function') {
                        try {
                            onFound(widget);
                        } catch (callbackError) {
                            console.warn(
                                'GridSearch: onFound callback threw an error:',
                                callbackError,
                            );
                        }
                    }

                    if (debug) {
                        console.log(
                            `GridSearch: Found widget "${gridName}" on attempt ${attempts}`,
                        );
                    }

                    resolve(widget);
                    return;
                }
            }

            if (attempts < maxRetries) {
                setTimeout(attemptFind, retryDelay);
            } else {
                const errorMessage = `GridSearch: Could not find grid "${gridName}" after ${maxRetries} attempts.`;
                console.error(errorMessage);
                reject(new Error(errorMessage));
            }
        }

        attemptFind();
    });
}
