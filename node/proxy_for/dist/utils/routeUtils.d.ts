declare function getRouteCoordinatesFromDB({ line, destination, type }: {
    line: string;
    destination: string;
    type: string;
}): Promise<Array<[number, number]>>;
export declare function getRouteStops(line: string, destination: string, type: string): Promise<void>;
export { getRouteCoordinatesFromDB };
//# sourceMappingURL=routeUtils.d.ts.map