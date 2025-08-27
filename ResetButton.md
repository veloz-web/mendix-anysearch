# ResetButton (Grid Reset Widget)

## Overview

ResetButton provides a simple way to clear all active search filters for a Mendix grid. It can also trigger a
microflow/nanoflow on reset.

## Usage

-   Add ResetButton to your page.
-   Set `targetGridName` to match your grid.
-   Optionally set `buttonCaption` and `onClickAction`.

## Properties

| Property       | Type   | Description                            |
| -------------- | ------ | -------------------------------------- |
| targetGridName | string | Name of the grid to reset filters for  |
| buttonCaption  | string | Caption for the reset button           |
| onClickAction  | action | Optional microflow/nanoflow to trigger |

## Features

-   Clears all search/filter widgets for the grid
-   Optionally triggers a Mendix action on reset
-   Coordinates with ActiveFilters and other widgets

## Permissions

-   Needs permission for any microflow/nanoflow defined in `onClickAction`
-   Otherwise, no special permissions required

## Typical Use Case

Use ResetButton to provide users a quick way to clear all filters and restore the grid to its default state.
