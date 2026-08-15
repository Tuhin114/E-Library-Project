/**
 * Radix Select doesn't allow an empty-string item value, so "no filter
 * selected" is represented by this sentinel instead and always
 * translated back to `undefined` before it reaches the URL/query
 * params. Shared by DiscoveryToolbar and FilterSidebar so both stay in
 * sync on how "no filter" is represented.
 */
export const ALL_FILTER_VALUE = "__all__";
