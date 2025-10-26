export declare function getStopsFromDB(): Promise<any[]>;
export declare function getNextDeparturesByStopId(stopId: number): Promise<any[]>;
export declare function getStopsByRoute(params: {
    line: string;
    type: string;
    destination: string;
}): Promise<any[]>;
//# sourceMappingURL=stopsUtils.d.ts.map