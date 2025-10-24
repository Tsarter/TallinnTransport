/**
 * StopPopupContent component displays departure information for a stop
 * Fetches and formats departure times with realtime indicators
 */

import { useQuery } from '@tanstack/react-query';
import { useMapStore } from '../store/mapStore';
import type { Stop, Departure } from '../types';
import { fetchStopDepartures } from '../../../shared/api.js';
import { minutesUntilTime, formattedScheduledTime } from '../../../shared/utils.js';
import {
  VEHICLE_TYPES_ENGLISH_TO_ESTONIAN,
  VEHICLE_TYPES_ENGLISH_TO_NUM,
} from '../../../shared/constants.js';
import { checkInterruption, getVehicleIconName } from '../../../shared/utils.js';
import '../styles/stopPopup.css';

interface StopPopupContentProps {
  stop: Stop;
}

interface GroupedDepartures {
  [routeId: string]: Departure[];
}

export function StopPopupContent({ stop }: StopPopupContentProps) {
  const interruptions = useMapStore((state) => state.interruptions);
  const setSelectedRoute = useMapStore((state) => state.setSelectedRoute);
  const setSelectedStop = useMapStore((state) => state.setSelectedStop);

  // Fetch departures for this stop
  const { data: departures, isLoading, error } = useQuery({
    queryKey: ['stop-departures', stop.stop_id],
    queryFn: async () => {
      const deps = await fetchStopDepartures(stop.stop_id, 10);
      return deps as Departure[];
    },
    staleTime: 30000, // Refresh every 30 seconds
  });

  const handleRouteClick = (type: number, lineNum: string, destination: string) => {
    setSelectedRoute({ type, line: lineNum, destination });
    setSelectedStop(stop);
  };

  if (isLoading) {
    return (
      <div className="stop-popup">
        <div className="stop-popup-header">{stop.stop_name}</div>
        <div style={{ padding: '10px' }}>Laen väljumisi...</div>
      </div>
    );
  }

  if (error || !departures || departures.length === 0) {
    return (
      <div className="stop-popup">
        <div className="stop-popup-header">{stop.stop_name}</div>
        <div style={{ padding: '10px' }}>Väljumisi ei leitud.</div>
      </div>
    );
  }

  // Sort departures by time
  const sortedDepartures = [...departures].sort(
    (a, b) => minutesUntilTime(a.departure_time) - minutesUntilTime(b.departure_time)
  );

  // Group by route
  const grouped: GroupedDepartures = {};
  sortedDepartures.forEach((dep) => {
    if (!grouped[dep.route_id]) grouped[dep.route_id] = [];
    grouped[dep.route_id].push(dep);
  });

  return (
    <div className="stop-popup">
      <div className="stop-popup-header">{stop.stop_name}</div>
      {Object.entries(grouped).map(([routeId, deps]) => {
        // Sort and take top 3
        const sortedDeps = deps.sort(
          (a, b) => minutesUntilTime(a.departure_time) - minutesUntilTime(b.departure_time)
        );
        const top3 = sortedDeps.slice(0, 3);
        const first = top3[0];

        const vehicleTypeEstonian =
          VEHICLE_TYPES_ENGLISH_TO_ESTONIAN[first.route_id.split('_')[1]] || 'Buss';
        const vehicleTypeNum = VEHICLE_TYPES_ENGLISH_TO_NUM[first.route_id.split('_')[1]] || 2;

        const { ongoingInterruption, announcement } = checkInterruption(
          interruptions,
          first.route_short_name,
          vehicleTypeEstonian,
          first.trip_headsign,
          true
        );

        const vehicleIconName = getVehicleIconName(vehicleTypeEstonian, ongoingInterruption);
        const earliestTil = minutesUntilTime(first.departure_time);

        // Format all times for this route
        const timesHtml = top3
          .map((d) => formattedScheduledTime(d.scheduled_time, d.departure_time))
          .join(' ');

        const timeClass = first.is_realtime ? 'realtime-time' : 'scheduled-time';

        return (
          <div key={routeId}>
            <div
              className="stop-popup-departure-row"
              onClick={() =>
                handleRouteClick(vehicleTypeNum, first.route_short_name, first.trip_headsign)
              }
            >
              <div className="bus-icon-wrapper">
                <img src={`/assets/${vehicleIconName}`} className="bus-icon" alt={vehicleTypeEstonian} />
                <span className="bus-icon-text">{first.route_short_name}</span>
              </div>
              <div className="stop-popup-departure-info">
                <div style={{ fontWeight: 'bolder' }}>{first.trip_headsign}</div>
                <div
                  className="departure-times"
                  dangerouslySetInnerHTML={{ __html: timesHtml }}
                />
              </div>
              <div className={timeClass}>{earliestTil} min</div>
            </div>
            {ongoingInterruption && (
              <div className="stop-popup-interruption">{announcement}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
