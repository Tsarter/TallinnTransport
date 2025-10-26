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
//# sourceMappingURL=mapper.d.ts.map