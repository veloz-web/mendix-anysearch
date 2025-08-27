/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { createElement } from "react";
import "./ui/AnySearch.css";

class AnySearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoaded: false
        };

        // Internal variables
        this._contextObj = null;
        this._currentFilter = null;
        this._subscriptions = [];
        this._grids = [];
        this._searchTimeout = null;
        this._renderingComplete = false; // Add this flag from the original
        this._updateInProgress = false; // Prevent concurrent updates
    }

    componentDidMount() {
        this._contextObj = this.props.mxObject;
        this._setupGrid();
        // Don't set isLoaded immediately - wait for rendering to complete
    }

    componentDidUpdate(prevProps) {
        if (prevProps.mxObject !== this.props.mxObject) {
            // Reset rendering state when context object changes
            this._renderingComplete = false;
            this._contextObj = this.props.mxObject;
            this._resetSubscriptions();
            this._setupGrid(); // Re-setup when context changes
        }
    }

    componentWillUnmount() {
        this._unsubscribeAll();
        clearTimeout(this._searchTimeout);
    }

    render() {
        if (!this.state.isLoaded) {
            return <div className="anysearch-loading">Loading...</div>;
        }

        return (
            <div className="anysearch-widget">
                {/* This component manages search via context object attributes */}
                {/* No visible UI - it's a logic-only widget */}
                <div className="anysearch-hidden" style={{ display: "none" }}>
                    AnySearch Widget Active
                </div>
            </div>
        );
    }

    _setupGrid() {
        const { targetGridName, targetGridClass } = this.props;
        const gridClass = targetGridClass || (targetGridName ? `mx-name-${targetGridName}` : null);

        if (!gridClass) {
            this._completeRendering();
            return;
        }

        // Use multiple attempts with increasing delays to ensure grids are ready
        this._attemptGridConnection(gridClass, 0);
    }

    _attemptGridConnection(gridClass, attempt) {
        const maxAttempts = 10;
        const delays = [100, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000];

        setTimeout(() => {
            const gridElements = document.querySelectorAll(`.${gridClass}`);
            let foundGrids = false;

            gridElements.forEach(gridElement => {
                if (this._connectGrid(gridElement)) {
                    foundGrids = true;
                }
            });

            if (foundGrids || attempt >= maxAttempts - 1) {
                this._completeRendering();
            } else {
                // Try again with longer delay
                this._attemptGridConnection(gridClass, attempt + 1);
            }
        }, delays[attempt] || 1000);
    }

    _connectGrid(gridElement) {
        let widget = null;

        if (gridElement.widget) {
            widget = gridElement.widget;
        } else if (gridElement._widget) {
            widget = gridElement._widget;
        } else {
            const widgetId = gridElement.getAttribute("data-mendix-id") || gridElement.id;
            // Use the global Mendix client API instead of importing 'mendix/ui'
            if (widgetId && window.mx?.ui?.getWidget) {
                try {
                    widget = window.mx.ui.getWidget(widgetId);
                } catch (e) {
                    console.warn("Widget not found:", widgetId);
                }
            }
        }

        if (widget) {
            // Check if this grid is already connected
            if (!this._grids.includes(widget)) {
                this._grids.push(widget);
            }
            return true;
        }
        return false;
    }

    _completeRendering() {
        if (this._renderingComplete) {
            return;
        }

        this._renderingComplete = true;
        this.setState({ isLoaded: true });
        this._resetSubscriptions();

        // Only fire search after rendering is complete
        setTimeout(() => {
            this._fireSearch();
        }, 100);
    }

    _fireSearch() {
        // Prevent concurrent searches and ensure rendering is complete
        if (this._updateInProgress || !this._renderingComplete) {
            return;
        }

        if (!this._contextObj || !this.props.xpathAttribute) {
            return;
        }

        this._updateInProgress = true;

        const constraint = this._contextObj.get(this.props.xpathAttribute);

        // Update current filter for display using both filterLabelName and labelAttribute
        if (this.props.labelAttribute) {
            if (this._contextObj.getAttributeType(this.props.labelAttribute) === "Enum") {
                this._currentFilter = this._contextObj.getEnumCaption(
                    this.props.labelAttribute,
                    this._contextObj.get(this.props.labelAttribute)
                );
            } else {
                this._currentFilter = this._contextObj.get(this.props.labelAttribute);
            }

            // Prepend filter label name if provided
            if (this.props.filterLabelName) {
                this._currentFilter = `${this.props.filterLabelName}: ${this._currentFilter}`;
            }
        }

        // Handle sorting if configured
        this._applySorting();

        // Handle pagination if configured
        this._applyPagination();

        // Handle hide list functionality
        this._handleHideList(true);

        // Apply to all connected grids
        let completedGrids = 0;
        const totalGrids = this._grids.length;

        if (totalGrids === 0) {
            this._updateInProgress = false;
            return;
        }

        const onGridComplete = () => {
            completedGrids++;
            if (completedGrids >= totalGrids) {
                this._updateInProgress = false;
                this._handleHideList(false);
            }
        };

        this._grids.forEach(grid => {
            const datasource = grid._datasource || grid._dataSource;
            if (datasource) {
                if (datasource.setConstraints) {
                    datasource.setConstraints(constraint || "");
                }

                // Apply pagination settings
                this._applyPaginationToGrid(grid);

                if (typeof grid.reload === "function") {
                    grid.reload(() => {
                        this._updateCountAndPagination(grid);
                        onGridComplete();
                    });
                } else if (datasource && typeof datasource.reload === "function") {
                    datasource.reload(() => {
                        this._updateCountAndPagination(grid);
                        onGridComplete();
                    });
                } else {
                    onGridComplete();
                }
            } else {
                onGridComplete();
            }
        });
    }

    _applySorting() {
        if (!this.props.sortAttribute || !this._contextObj) {
            return;
        }

        const sortValue = this._contextObj.get(this.props.sortAttribute);
        if (sortValue) {
            try {
                const sortArray = JSON.parse(sortValue);
                // Apply sorting logic to grids
                this._grids.forEach(grid => {
                    const datasource = grid._datasource || grid._dataSource;
                    if (datasource && datasource.setSorting) {
                        datasource.setSorting(sortArray);
                    }
                });
            } catch (e) {
                console.warn("Invalid sort format:", sortValue);
            }
        }
    }

    _applyPagination() {
        // This method prepares pagination settings from context object
        // The actual application happens in _applyPaginationToGrid
    }

    _applyPaginationToGrid(grid) {
        if (!this._contextObj) {
            return;
        }

        const datasource = grid._datasource || grid._dataSource;
        if (!datasource) {
            return;
        }

        // Apply page size
        if (this.props.pagesizeAttribute) {
            const pageSize = this._contextObj.get(this.props.pagesizeAttribute);
            if (pageSize && datasource.setPageSize) {
                datasource.setPageSize(parseInt(pageSize, 10));
            }
        }

        // Apply offset
        if (this.props.offsetAttribute) {
            const offset = this._contextObj.get(this.props.offsetAttribute);
            if (offset !== null && datasource.setOffset) {
                datasource.setOffset(parseInt(offset, 10));
            }
        }
    }

    _handleHideList(hide) {
        if (!this.props.hideList || !this._contextObj) {
            return;
        }

        this._contextObj.set(this.props.hideList, hide);
    }

    _updateCountAndPagination(grid) {
        if (!this._contextObj) {
            return;
        }

        const datasource = grid._datasource || grid._dataSource;
        if (!datasource) {
            return;
        }

        // Update count - this property exists in XML
        if (this.props.countAttribute) {
            const totalCount = datasource.totalCount || datasource.getSetSize() || 0;
            this._contextObj.set(this.props.countAttribute, totalCount);
        }

        // Update pagination info
        if (this.props.startAttribute || this.props.endAttribute) {
            const pageSize = this.props.pagesizeAttribute
                ? this._contextObj.get(this.props.pagesizeAttribute) || 20
                : 20;
            const offset = this.props.offsetAttribute ? this._contextObj.get(this.props.offsetAttribute) || 0 : 0;

            if (this.props.startAttribute) {
                this._contextObj.set(this.props.startAttribute, offset + 1);
            }

            if (this.props.endAttribute) {
                const totalCount = this.props.countAttribute ? this._contextObj.get(this.props.countAttribute) || 0 : 0;
                const endIndex = Math.min(offset + pageSize, totalCount);
                this._contextObj.set(this.props.endAttribute, endIndex);
            }
        }
    }

    async _clear() {
        if (!this._contextObj) {
            return;
        }

        this._contextObj.set(this.props.xpathAttribute, null);
        this._currentFilter = null;

        try {
            // Try nanoflow first, then regular action
            if (this.props.onClearNanoflowAction && this.props.onClearNanoflowAction.canExecute) {
                await this.props.onClearNanoflowAction.execute();
            } else if (this.props.onClearAction && this.props.onClearAction.canExecute) {
                await this.props.onClearAction.execute();
            }

            // Only fire search if rendering is complete
            if (this._renderingComplete) {
                this._fireSearch();
            }
        } catch (error) {
            console.error("Error executing clear action:", error);
        }
    }

    _resetSubscriptions() {
        this._unsubscribeAll();

        if (!this._contextObj) {
            return;
        }

        const watchAttribute = attrProp => {
            if (this.props[attrProp]) {
                const subscription = this._contextObj.subscribe({
                    attr: this.props[attrProp],
                    callback: () => {
                        clearTimeout(this._searchTimeout);
                        this._searchTimeout = setTimeout(() => {
                            // Only fire search if rendering is complete
                            if (this._renderingComplete) {
                                this._fireSearch();
                            }
                        }, 250);
                    }
                });
                if (subscription) {
                    this._subscriptions.push(subscription);
                }
            }
        };

        // Watch all the key attributes
        watchAttribute("xpathAttribute");
        watchAttribute("sortAttribute");
        watchAttribute("pagesizeAttribute");
        watchAttribute("offsetAttribute");
        watchAttribute("labelAttribute");
    }

    _unsubscribeAll() {
        this._subscriptions.forEach(sub => {
            if (sub && sub.unsubscribe) {
                sub.unsubscribe();
            }
        });
        this._subscriptions = [];
    }
}

export default AnySearch;
