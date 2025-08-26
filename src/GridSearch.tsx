import { JSX } from 'react';
import { FilterRegistry } from './components/FilterRegistry';
import './ui/GridSearch.scss';

interface FilterType {
    value?: string;
}

interface GridSearchProps {
    filterType?: FilterType;
    [key: string]: any;
}

export function GridSearch(props: GridSearchProps): JSX.Element {
    const filterKey = props.filterType?.value ?? '';
    const FilterComponent = FilterRegistry[filterKey];

    return (
        <div className="grid-search-widget">
            {FilterComponent ? (
                <FilterComponent {...props} />
            ) : (
                <div className="alert alert-danger">
                    Unknown filter type: <strong>{filterKey}</strong>
                </div>
            )}
        </div>
    );
}
