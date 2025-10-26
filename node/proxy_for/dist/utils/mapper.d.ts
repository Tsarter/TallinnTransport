export declare function mapTallinnLiveDeparturesResponseToJson(text: string): {
    transport: string | undefined;
    routeNum: string | undefined;
    expectedTime: string;
    scheduleTime: string;
    destination: string | undefined;
    unknown1: string | undefined;
    unknown2: string | undefined;
}[];
export declare function mapTallinnVehiclePositionsResponseToJson(text: string, destination: string): {
    buses: never[];
    trams: never[];
    trolleys: never[];
};
/**
 * Convert Elron train data to TLT CSV format
 * TLT CSV format: type,lineNum,lon,lat,,direction,vehicleId,,tripId,destination
 * @param trains - Array of Elron train objects
 * @returns CSV string in TLT format
 */
export declare function mapElronTrainsToCsv(trains: any[]): string;
//# sourceMappingURL=mapper.d.ts.map