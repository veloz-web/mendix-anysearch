import { EditableValue } from "mendix";
import { Big } from "big.js";

/**
 * Gets the value from an EditableValue if available
 * @param attr - The EditableValue attribute
 * @returns The value if available, undefined otherwise
 */
export const getValue = <T extends string | boolean | Big | Date>(attr: EditableValue<T> | undefined): T | undefined =>
    attr && attr.status === "available" ? attr.value : undefined;

/**
 * Gets the display value from an EditableValue if available
 * @param attr - The EditableValue attribute
 * @returns The display value if available, undefined otherwise
 */
export const getDisplayValue = <T extends string | boolean | Big | Date>(
    attr: EditableValue<T> | undefined
): string | undefined => (attr && attr.status === "available" ? attr.displayValue : undefined);

/**
 * Sets a value on an EditableValue if it's available and not read-only
 * @param attr - The EditableValue attribute
 * @param value - The value to set
 */
export const setValue = <T extends string | boolean | Big | Date>(
    attr: EditableValue<T> | undefined,
    value: T | undefined
): void => {
    if (attr && attr.status === "available" && typeof (attr as any).setValue === "function") {
        try {
            (attr as any).setValue(value);
        } catch (e) {
            console.error("setValue error:", e);
        }
    }
};

/**
 * Checks if an EditableValue is available and not read-only
 * @param attr - The EditableValue attribute
 * @returns True if the attribute can be modified
 */
export const isEditable = <T extends string | boolean | Big | Date>(attr: EditableValue<T> | undefined): boolean =>
    !!(attr && attr.status === "available" && !attr.readOnly);

/**
 * Checks if an EditableValue has a validation error
 * @param attr - The EditableValue attribute
 * @returns True if there's a validation error
 */
export const hasValidationError = <T extends string | boolean | Big | Date>(
    attr: EditableValue<T> | undefined
): boolean => !!(attr && attr.status === "available" && attr.validation);

/**
 * Gets the validation message from an EditableValue
 * @param attr - The EditableValue attribute
 * @returns The validation message if present, undefined otherwise
 */
export const getValidationMessage = <T extends string | boolean | Big | Date>(
    attr: EditableValue<T> | undefined
): string | undefined => (attr && attr.status === "available" ? attr.validation : undefined);

/**
 * Safely converts a value to string for operations like JSON.parse
 * @param attr - The EditableValue attribute
 * @returns String value if available and is string type, undefined otherwise
 */
export const getStringValue = (attr: EditableValue<string> | undefined): string | undefined => {
    const value = getValue(attr);
    return typeof value === "string" ? value : undefined;
};

/**
 * Gets a numeric value as a number (works with Big.js values)
 * @param attr - The EditableValue attribute containing a Big value
 * @returns Number value if available, undefined otherwise
 */
export const getNumericValue = (attr: EditableValue<Big> | undefined): number | undefined => {
    const value = getValue(attr);
    return value ? value.toNumber() : undefined;
};

/**
 * Sets a numeric value from a number (converts to Big.js)
 * @param attr - The EditableValue attribute for Big values
 * @param value - The number value to set
 */
export const setNumericValue = (attr: EditableValue<Big> | undefined, value: number | undefined): void => {
    if (value !== undefined) {
        setValue(attr, new Big(value));
    } else {
        setValue(attr, undefined);
    }
};
