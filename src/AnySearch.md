# AnySearch Analysis

## Purpose:

-   AnySearch.js is a context-aware search widget for Mendix grids.
-   It supports advanced search, paging, sorting, and clearing via microflow/nanoflow.
-   It uses context object attributes for search, sort, page size, offset, etc.
-   It can execute microflows/nanoflows for clearing the search.

## Required Properties for XML:

-   targetGridName (string): Name of the grid to target.
-   xpathAttribute (attribute): Attribute holding the XPath constraint.
-   sortAttribute (attribute): Attribute for sorting.
-   pagesizeAttribute (attribute): Attribute for page size.
-   offsetAttribute (attribute): Attribute for offset.
-   startAttribute (attribute): Attribute for page start.
-   endAttribute (attribute): Attribute for page end.
-   hideList (attribute): Attribute to hide the list.
-   labelAttribute (attribute): Attribute for the label shown in active filters.
-   onClearNf (nanoflow): Nanoflow to execute on clear.
-   onClearMf (microflow): Microflow to execute on clear.
