/**
 * This file was generated from GridSearch.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue } from "mendix";
import { Big } from "big.js";

export type FilterTypeEnum = "multifield" | "button" | "dropdownStatic" | "localCheckbox" | "resetButton" | "anysearch";

export type SearchMethodParamEnum = "contains" | "startswith";

export interface SearchAttributesType {
    searchAttributeParam: EditableValue<string | Big>;
    searchMethodParam: SearchMethodParamEnum;
}

export interface SearchOptionsType {
    key: string;
    optionLabel: any;
    optionXPath: string;
    isDefault: boolean;
}

export type MultiselectBehaviorEnum = "or" | "and";

export interface SearchAttributesPreviewType {
    searchAttributeParam: string;
    searchMethodParam: SearchMethodParamEnum;
}

export interface SearchOptionsPreviewType {
    key: string;
    optionLabel: any;
    optionXPath: string;
    isDefault: boolean;
}

export interface GridSearchContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    targetGridName: string;
    filterType: FilterTypeEnum;
    xpathAttribute?: EditableValue<string>;
    searchAttributes: SearchAttributesType[];
    minCharacters: number;
    placeholderText?: any;
    renderAsTextarea: boolean;
    textareaRows: number;
    allowOrConditions: boolean;
    splitString: string;
    searchOptions: SearchOptionsType[];
    allowMultiselect: boolean;
    multiselectBehavior: MultiselectBehaviorEnum;
    activeClass: string;
    groupedButtons: boolean;
    blankOptionLabel?: any;
    searchAttribute?: EditableValue<string | boolean>;
    booleanCaption?: any;
    onClearAction?: ActionValue;
    buttonCaption?: any;
    sortAttribute?: EditableValue<string>;
    pagesizeAttribute?: EditableValue<Big>;
    offsetAttribute?: EditableValue<Big>;
}

export interface GridSearchPreviewProps {
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
    filterType: FilterTypeEnum;
    xpathAttribute: string;
    searchAttributes: SearchAttributesPreviewType[];
    minCharacters: number | null;
    placeholderText: any;
    renderAsTextarea: boolean;
    textareaRows: number | null;
    allowOrConditions: boolean;
    splitString: string;
    searchOptions: SearchOptionsPreviewType[];
    allowMultiselect: boolean;
    multiselectBehavior: MultiselectBehaviorEnum;
    activeClass: string;
    groupedButtons: boolean;
    blankOptionLabel: any;
    searchAttribute: string;
    booleanCaption: any;
    onClearAction: {} | null;
    buttonCaption: any;
    sortAttribute: string;
    pagesizeAttribute: string;
    offsetAttribute: string;
}
