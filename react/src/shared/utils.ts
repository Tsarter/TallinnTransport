/**
 * Shared utility functions for both vanilla JS and React versions
 */

/**
 * Calculate minutes until a specific time
 * @param hhmmss - Time in HH:MM:SS format
 * @param now - Reference time (defaults to current time)
 * @returns Minutes until the specified time (can be negative if time has passed)
 */
export function minutesUntilTime(hhmmss: string, now: Date = new Date()): number {
  const [h, m, s] = hhmmss.split(':').map(Number);

  const departure = new Date(now);
  departure.setHours(h, m, s, 0);

  let diffMs = departure.getTime() - now.getTime();
  // Handle times after midnight (e.g., 25:30:00 for 1:30 AM next day)
  if (diffMs < -12 * 60 * 60 * 1000) {
    departure.setDate(departure.getDate() + 1);
    diffMs = departure.getTime() - now.getTime();
  }

  return Math.round(diffMs / 60000);
}

/**
 * Format scheduled time with delay indicator
 * @param scheduledTime - Scheduled departure time (HH:MM:SS)
 * @param departureTime - Actual departure time (HH:MM:SS)
 * @returns Formatted time with HTML superscript for delay
 */
export function formattedScheduledTime(scheduledTime: string, departureTime: string): string {
  // Format departure time to show only hours and rounded minutes, no seconds
  let [h, m, s] = scheduledTime.split(':').map(Number);
  if (s >= 30) m += 1;
  if (m === 60) {
    m = 0;
    h += 1;
  }
  const formattedTime = `${h.toString().padStart(2, '0')}:${m
    .toString()
    .padStart(2, '0')}`;

  const [hours, minutes, seconds] = scheduledTime.split(':');
  const scheduledTimeDate = new Date();
  scheduledTimeDate.setHours(Number(hours), Number(minutes), Number(seconds), 0);

  const minTil = minutesUntilTime(departureTime, scheduledTimeDate);
  let minutesSup = '';
  if (minTil == 0) {
    minutesSup = '';
  } else if (minTil > 0) {
    minutesSup = `<sup class="minutesSup">+${minTil}</sup>`;
  } else if (minTil < 0) {
    minutesSup = `<sup class="minutesSup">${minTil}</sup>`;
  }

  return `${formattedTime}${minutesSup}`;
}

/**
 * Detect if device is mobile or desktop
 * @returns 'Mobile' or 'Desktop'
 */
export function detectDevice(): string {
  return /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
}

/**
 * Generate vehicle icon filename based on type and interruption status
 * @param iconType - Vehicle type in Estonian (Buss, Tramm, Rong)
 * @param ongoingInterruption - Whether there's an ongoing service interruption
 * @returns Icon filename
 */
export function getVehicleIconName(iconType: string, ongoingInterruption: boolean): string {
  return `${iconType}${ongoingInterruption ? 'Warning' : ''}Icon.svg`;
}

/**
 * Generate unique key for a vehicle
 * @param type - Vehicle type code
 * @param vehicleId - Vehicle ID
 * @returns Unique key string
 */
export function getVehicleKey(type: number, vehicleId: number): string {
  return `${type}-${vehicleId}`;
}

/**
 * Parse interruptions data into a lookup object
 * @param rawInterruptions - Raw interruptions array from API
 * @returns Interruptions keyed by "lineNum-vehicleType-destination"
 */
export function parseInterruptions(rawInterruptions: any[]): Record<string, any> {
  const interruptions: Record<string, any> = {};

  for (const data of rawInterruptions) {
    for (const route of data.routes.split(',')) {
      let cleanedRoute = '';
      let destination = '';

      if (route.includes('->')) {
        [cleanedRoute, destination] = route.split('->').map((s: string) => s.trim());
      } else {
        cleanedRoute = route.trim();
        destination = 'both';
      }

      const interruption = {
        transport: data.transport,
        route: cleanedRoute,
        destination: destination,
        start_time: data.start_time,
        announcement: data.announcement,
        info: data.info,
      };

      const key = `${cleanedRoute}-${data.transport}-${destination}`;
      interruptions[key] = interruption;
    }
  }

  return interruptions;
}

/**
 * Check if there's an interruption for a specific route
 * @param interruptions - Interruptions lookup object
 * @param lineNum - Line number
 * @param vehicleType - Vehicle type in Estonian
 * @param destination - Trip destination
 * @param noLineBreaks - Whether to format without line breaks
 * @returns Object with announcement and ongoingInterruption flag
 */
export function checkInterruption(
  interruptions: Record<string, any>,
  lineNum: string,
  vehicleType: string,
  destination: string,
  noLineBreaks: boolean = false
): { announcement: string; ongoingInterruption: boolean } {
  const wholeInterruptionKey = `${lineNum}-${vehicleType}-both`;
  const partialInterruptionKey = `${lineNum}-${vehicleType}-${destination}`;

  let announcement = '';
  let ongoingInterruption = false;

  if (
    wholeInterruptionKey in interruptions ||
    partialInterruptionKey in interruptions
  ) {
    const interruption =
      wholeInterruptionKey in interruptions
        ? interruptions[wholeInterruptionKey]
        : interruptions[partialInterruptionKey];

    const info = interruption.info?.trim();
    const ann = interruption.announcement?.trim();

    if (info && ann) {
      announcement = `${ann} ${info}`;
    } else if (info) {
      announcement = info;
    } else if (ann) {
      announcement = ann;
    } else {
      announcement = '';
    }
        
    ongoingInterruption = true;
  }

  return { announcement, ongoingInterruption };
}

/**
 * Calculate straight-line distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate walking time between two coordinates
 * Assumes average walking speed of 4.2 km/h
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Walking time in minutes
 */
export function calculateWalkingTime(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
  const walkingSpeedKmPerHour = 4.2;
  return Math.ceil((distanceKm / walkingSpeedKmPerHour) * 60);
}
