# AnySearch - Mendix Pluggable Widget

A flexible and powerful search widget for Mendix applications that provides advanced grid search capabilities with pagination control and customizable clear actions. This widget works by dynamically applying XPath constraints to grid datasources and triggering complete grid reloads to populate all matching results.

## How It Works

The AnySearch widget operates by directly interfacing with Mendix grid datasources to apply search constraints and trigger full data reloads. Here's the core mechanism:

### Search Flow

1. **XPath Constraint Generation**: When a search is triggered, the widget reads an XPath constraint from a configured attribute (e.g., `"[Name = 'John']"`)

2. **Grid Discovery**: The widget locates target grids on the page using either:
   - Grid Name: `mx-name-{targetGridName}` CSS class
   - Custom CSS Class: Direct class selector

3. **Datasource Manipulation**: For each discovered grid, the widget:
   - Accesses the grid's underlying datasource (`_datasource`, `_dataSource`, or `datasource`)
   - Applies the XPath constraint using `datasource.setConstraints(constraint)`
   - Handles "wait for search" grids by setting the `_searchFilled` flag
   - Manages pagination with `setPageSize()` and `setOffset()`

4. **Grid Reload**: The widget triggers a complete grid reload using multiple fallback methods:
   - `grid.reload(callback)` - Modern Mendix versions
   - `datasource.reload(callback)` - Direct datasource reload
   - `grid.update(undefined, callback)` - Legacy update method
   - `grid.sequence(["_sourceReload", "_renderData"], callback)` - Older Mendix versions

5. **Result Population**: After reload, the widget:
   - Reads the total result count from `datasource._setSize` (primary) or `datasource.totalCount`
   - Updates pagination attributes (start index, end index, total count)
   - Manages UI state (hiding/showing grids during loading)

### Key Technical Details

- **Constraint Change Detection**: The widget compares `datasource._constraints` with the new constraint to detect changes and reset pagination when needed
- **Wait-for-Search Support**: Grids configured with "wait for search" receive special handling via the `_searchFilled` flag and `[1=0]` constraints for empty states
- **Multiple Grid Support**: A single widget can control multiple grids with the same class/name
- **Retry Logic**: Grid connection uses exponential backoff retry logic to handle timing issues with grid initialization

## Features

-   **Grid Integration**: Seamlessly integrates with Mendix data grids and list views
-   **Flexible Search**: Supports string and enum attribute searching
-   **Pagination Control**: Built-in pagination management with configurable page sizes
-   **Custom Clear Actions**: Execute nanoflows or microflows when clearing searches
-   **Real-time Updates**: Automatic grid refresh on search parameter changes
-   **Error Handling**: Robust error handling with user feedback
-   **Loading States**: Visual feedback during search operations

## Installation

1. Download the latest `Soar.AnySearch.mpk` from the releases
2. Import the widget into your Mendix project via the App Store or manual upload
3. Add the widget to your page and configure the properties

## Configuration

### General Settings

| Property          | Type   | Required | Description                                 |
| ----------------- | ------ | -------- | ------------------------------------------- |
| Target Grid Name  | String | No       | The name/ID of the target grid (creates `mx-name-{name}` selector) |
| Target Grid Class | String | No       | Custom CSS class of the target grid |

### Search Attributes

| Property                   | Type                  | Required | Description                                    |
| -------------------------- | --------------------- | -------- | ---------------------------------------------- |
| XPath Constraint Attribute | String Attribute      | Yes      | Attribute containing the XPath filter (e.g., `"[Name = 'John']"`) |
| Search Label Attribute     | String/Enum Attribute | Yes      | Attribute for display purposes in active filters |
| Sort Attribute             | String Attribute      | No       | JSON array for sorting: `[["Name", "asc"]]`   |

### Pagination

| Property             | Type                   | Required | Description                                |
| -------------------- | ---------------------- | -------- | ------------------------------------------ |
| Page Size Attribute  | Integer/Long Attribute | No       | Attribute to control the page size         |
| Offset Attribute     | Integer/Long Attribute | No       | Attribute to control the pagination offset |
| Page Start Attribute | Integer/Long Attribute | No       | Attribute to store the page start index    |
| Page End Attribute   | Integer/Long Attribute | No       | Attribute to store the page end index      |

### Display Control

| Property            | Type              | Required | Description                                                |
| ------------------- | ----------------- | -------- | ---------------------------------------------------------- |
| Hide List Attribute | Boolean Attribute | No       | Boolean attribute to control list visibility during search |

### Clear Actions

| Property           | Type      | Required | Description                                   |
| ------------------ | --------- | -------- | --------------------------------------------- |
| On Clear Nanoflow  | Nanoflow  | No       | Nanoflow to execute when clearing the search  |
| On Clear Microflow | Microflow | No       | Microflow to execute when clearing the search |

## Usage

### Basic Setup

1. **Create a Context Entity**: Create a non-persistent entity to hold search parameters:

    ```
    SearchContext (NPE)
    - SearchTerm (String)
    - XPathConstraint (String)
    - PageSize (Integer, default: 20)
    - Offset (Integer, default: 0)
    - PageStart (Integer)
    - PageEnd (Integer)
    - HideResults (Boolean)
    ```

2. **Add Widget to Page**: Place the AnySearch widget in a data view with the SearchContext entity

3. **Configure Properties**:

    - Set "Search Label Attribute" to `SearchTerm`
    - Set "XPath Constraint Attribute" to `XPathConstraint`
    - Configure pagination attributes as needed

4. **Configure Target Grid**: Set either "Target Grid Name" or "Target Grid Class" to identify the grid to refresh

### Advanced Configuration

#### Custom Clear Actions

Create a nanoflow or microflow to handle custom clear logic:

```javascript
// Example clear nanoflow
// - Reset additional search parameters
// - Refresh related data
// - Show notifications
```

#### Enum Support

The widget automatically handles enum attributes for the search label, displaying enum captions instead of technical
values.

#### Pagination Integration

When pagination attributes are configured, the widget automatically manages:

-   Page size calculation
-   Offset tracking
-   Start/end index management
-   Grid refresh timing

## Styling

The widget provides several CSS classes for customization:

```css
.anysearch-widget {
    /* Main widget container */
}

.anysearch-controls {
    /* Controls container */
}

.anysearch-input {
    /* Search input field */
}

.anysearch-button {
    /* Base button styles */
}

.anysearch-search {
    /* Search button specific styles */
}

.anysearch-clear {
    /* Clear button specific styles */
}

.anysearch-error {
    /* Error message styles */
}
```

## Examples

### Basic Search Implementation

```xml
<!-- Page with data view containing SearchContext -->
<dataview datasource="microflow://MyModule.DS_CreateSearchContext">
    <!-- AnySearch widget -->
    <widget type="anysearch.widget.AnySearch">
        <properties>
            <property key="labelAttribute">SearchTerm</property>
            <property key="xpathAttribute">XPathConstraint</property>
            <property key="targetGridClass">my-search-grid</property>
        </properties>
    </widget>

    <!-- Target data grid -->
    <datagrid
        class="my-search-grid"
        datasource="xpath://MyModule.MyEntity[contains(Name, $SearchContext/XPathConstraint)]"
    >
        <!-- Grid configuration -->
    </datagrid>
</dataview>
```

### With Pagination

```xml
<widget type="anysearch.widget.AnySearch">
    <properties>
        <property key="labelAttribute">SearchTerm</property>
        <property key="xpathAttribute">XPathConstraint</property>
        <property key="pagesizeAttribute">PageSize</property>
        <property key="offsetAttribute">Offset</property>
        <property key="startAttribute">PageStart</property>
        <property key="endAttribute">PageEnd</property>
        <property key="targetGridClass">paginated-grid</property>
    </properties>
</widget>
```

## Browser Support

-   Chrome 70+
-   Firefox 65+
-   Safari 12+
-   Edge 79+

## Troubleshooting

### Common Issues

1. **Grid not refreshing**: Ensure `targetGridName` or `targetGridClass` correctly identifies your grid
2. **Search not working**: Verify XPath constraint attribute is properly configured in your data source
3. **Pagination issues**: Check that pagination attributes are of Integer/Long type
4. **Enum display problems**: Ensure enum attribute has proper captions defined

### Debug Mode

Enable browser console logging to see detailed widget operation:

```javascript
// Look for debug messages prefixed with "AnySearch:"
console.debug("AnySearch: Triggering grid refresh...");
```

## Development

### Building from Source

```bash
npm install
npm run build
```

### Running Tests

```bash
npm run test
```

### Development Mode

```bash
npm run dev
```

## Changelog

### Version 1.0.0

-   Initial release
-   Basic search functionality
-   Grid integration
-   Pagination support
-   Error handling
-   Enum attribute support

## License

Copyright ©QVine 2025. All rights reserved.

Licensed under the Apache License, Version 2.0.

## Support

For support and questions, please contact the development team or create an issue in the project repository.

---

**Note**: This widget requires Mendix 9.18+ and is compatible with both Studio Pro and Studio.
