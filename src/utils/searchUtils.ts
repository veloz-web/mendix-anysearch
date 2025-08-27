import { Big } from "big.js";
import { EditableValue } from "mendix";

/**
 * Safely gets string value from EditableValue
 */
export function getConstraintValue(attr: EditableValue<string> | undefined): string {
    return attr?.status === "available" && attr.value ? attr.value : "";
}

/**
 * Safely gets Big number value from EditableValue
 */
export function getBigValue(attr: EditableValue<Big> | undefined, defaultValue = 0): number {
    try {
        if (attr?.status === "available" && attr.value) {
            return attr.value instanceof Big ? attr.value.toNumber() : Number(attr.value);
        }
    } catch {
        // ignore
    }
    return defaultValue;
}

/**
 * Safely sets value on EditableValue
 */
export function setValue(attribute: any, value: any): void {
    if (attribute?.status === "available" && typeof attribute.setValue === "function") {
        try {
            attribute.setValue(value);
        } catch (e) {
            console.error("setValue error:", e);
        }
    }
}
