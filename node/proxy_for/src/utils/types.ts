export type ElronTrain = {
    reis: string;
    liin: string;
    reisi_algus_aeg: string;
    reisi_lopp_aeg: string;
    kiirus: string;
    latitude: string;
    longitude: string;
    rongi_suund: string;
    erinevus_plaanist: string;
    lisateade: string;
    pohjus_teade: string;
    avalda_kodulehel: string;
    asukoha_uuendus: string;
    reisi_staatus: string;
    viimane_peatus: string;
};

export type ElronApiResponse = {
    status: number;
    data: ElronTrain[];
};

export type TltVehicle = {
    type: "1" | "2" | "3" | "8" | "10";
    line: string;
    longitude: string;
    latitude: string;
    unknown0?: string;
    direction: string;
    unknown1?: string;
    unknown2?: string;
    unknown_id: string;
    destination: string;
};


export type GpsData = {
    tltVehicles: TltVehicle[];
    trains: ElronTrain[];
}