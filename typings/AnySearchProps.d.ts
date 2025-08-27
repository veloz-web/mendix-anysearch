/**
 * This file was generated from AnySearch.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue } from "mendix";
import { Big } from "big.js";

export interface AnySearchContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    targetGridName: string;
    targetGridClass: string;
    xpathAttribute: EditableValue<string>;
    sortAttribute?: EditableValue<string>;
    pagesizeAttribute?: EditableValue<Big>;
    offsetAttribute?: EditableValue<Big>;
    countAttribute?: EditableValue<Big>;
    startAttribute?: EditableValue<Big>;
    endAttribute?: EditableValue<Big>;
    filterLabelName: string;
    labelAttribute: EditableValue<string>;
    hideList?: EditableValue<boolean>;
    onClearNanoflowAction?: ActionValue;
    onClearAction?: ActionValue;
}

export interface AnySearchPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    targetGridName: string;
    targetGridClass: string;
    xpathAttribute: string;
    sortAttribute: string;
    pagesizeAttribute: string;
    offsetAttribute: string;
    countAttribute: string;
    startAttribute: string;
    endAttribute: string;
    filterLabelName: string;
    labelAttribute: string;
    hideList: string;
    onClearNanoflowAction: {} | null;
    onClearAction: {} | null;
}
