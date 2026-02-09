export type SortAttributesOption = 'alphabetical' | 'frequency';

const validOptions = new Set<SortAttributesOption>(['frequency', 'alphabetical']);

export function resolveSortType(options: boolean | SortAttributesOption): SortAttributesOption | false {
    if (options === true) return 'alphabetical';
    if (options === false) return false;

    return validOptions.has(options) ? options : false;
}
