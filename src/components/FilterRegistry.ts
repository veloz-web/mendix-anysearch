// components/FilterRegistry.ts
import { MultiFieldSearch } from './MultiFieldSearch';
import { ButtonFilter } from './ButtonFilter';
import { StaticDropdown } from './StaticDropdown';
import { LocalCheckbox } from './LocalCheckbox';
import { ResetButton } from './ResetButton';
import { AnySearch } from './AnySearch';

export const FilterRegistry: Record<string, React.ComponentType<any>> = {
    multifield: MultiFieldSearch,
    button: ButtonFilter,
    dropdownStatic: StaticDropdown,
    localCheckbox: LocalCheckbox,
    resetButton: ResetButton,
    anysearch: AnySearch,
};
