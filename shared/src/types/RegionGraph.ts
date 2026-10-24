export interface RegionGraph {

    adjacency:
        Map<
            string,
            Set<string>
        >;
}