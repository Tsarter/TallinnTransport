function secondsToTimeString(seconds) {
    // Convert seconds since midnight to HH:MM:SS format
    // Use simple arithmetic instead of Date object to avoid DST issues
    // Check if today is a DST transition day by comparing midnight's offset to current offset
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    // Calculate timezone offset difference (in minutes)
    const midnightOffset = midnight.getTimezoneOffset();
    const currentOffset = now.getTimezoneOffset();
    const offsetDiffMinutes = midnightOffset - currentOffset;
    // On DST end days (fall back), the SIRI API includes the extra hour in its seconds count
    // We need to subtract it to get the correct wall clock time
    let adjustedSeconds = seconds;
    if (offsetDiffMinutes < 0) {
        // DST ended (offset increased, e.g., -180 to -120 means +60 minutes difference)
        adjustedSeconds = seconds + (offsetDiffMinutes * 60);
    }
    const hours = Math.floor(adjustedSeconds / 3600);
    const minutes = Math.floor((adjustedSeconds % 3600) / 60);
    const secs = adjustedSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
export function mapTallinnLiveDeparturesResponseToJson(text) {
    const lines = text.trim().split("\n");
    const dataLines = lines.slice(2);
    const departures = dataLines
        .filter((line) => !line.startsWith("Transport"))
        .map((line) => {
        const [transport, routeNum, expectedTimeInSeconds, scheduleTimeInSeconds, destination, unknown1, unknown2,] = line.split(",");
        return {
            transport,
            routeNum,
            expectedTime: secondsToTimeString(Number(expectedTimeInSeconds)),
            scheduleTime: secondsToTimeString(Number(scheduleTimeInSeconds)),
            destination,
            unknown1,
            unknown2,
        };
    });
    return departures;
}
export function mapTallinnVehiclePositionsResponseToJson(text, destination) {
    const lines = text.trim().split("\n");
    let tltMapped = { buses: [], trams: [], trolleys: [] };
    for (let line of lines) {
        let lineSplit = line.split(",");
        let json = {
            type: lineSplit[0],
            routeNum: lineSplit[1],
            lon: lineSplit[2],
            lat: lineSplit[3],
            course: lineSplit[5],
            timestamp: lineSplit[6],
            lineNumber: lineSplit[6],
            destination,
        };
    }
    return tltMapped;
}
//# sourceMappingURL=mapper.js.map