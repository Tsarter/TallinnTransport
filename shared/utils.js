/**
 * Shared utility functions for both vanilla JS and React versions
 */

/**
 * Calculate minutes until a specific time
 * @param {string} hhmmss - Time in HH:MM:SS format
 * @param {Date} now - Reference time (defaults to current time)
 * @returns {number} Minutes until the specified time (can be negative if time has passed)
 */
export function minutesUntilTime(hhmmss, now = new Date()) {
  const [h, m, s] = hhmmss.split(':').map(Number);

  const departure = new Date(now);
  departure.setHours(h, m, s, 0);

  let diffMs = departure - now;
  // Handle times after midnight (e.g., 25:30:00 for 1:30 AM next day)
  if (diffMs < -12 * 60 * 60 * 1000) {
    departure.setDate(departure.getDate() + 1);
    diffMs = departure - now;
  }

  return Math.round(diffMs / 60000);
}

/**
 * Format scheduled time with delay indicator
 * @param {string} scheduledTime - Scheduled departure time (HH:MM:SS)
 * @param {string} departureTime - Actual departure time (HH:MM:SS)
 * @returns {string} Formatted time with HTML superscript for delay
 */
export function formattedScheduledTime(scheduledTime, departureTime) {
  // Format departure time to show only hours and rounded minutes, no seconds
  let [h, m, s] = scheduledTime.split(':').map(Number);
  if (s >= 30) m += 1;
  if (m === 60) {
    m = 0;
    h += 1;
  }
  const formattedTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

  const [hours, minutes, seconds] = scheduledTime.split(':');
  const scheduledTimeDate = new Date();
  scheduledTimeDate.setHours(hours, minutes, seconds, 0);

  const minTil = minutesUntilTime(departureTime, scheduledTimeDate);
  let minutesSup = '';
  if (minTil == '0') {
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
 * @returns {string} 'Mobile' or 'Desktop'
 */
export function detectDevice() {
  return /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
}

/**
 * Generate vehicle icon filename based on type and interruption status
 * @param {string} iconType - Vehicle type in Estonian (Buss, Tramm, Rong)
 * @param {boolean} ongoingInterruption - Whether there's an ongoing service interruption
 * @returns {string} Icon filename
 */
export function getVehicleIconName(iconType, ongoingInterruption) {
  return `${iconType}${ongoingInterruption ? 'Warning' : ''}Icon.svg`;
}

/**
 * Generate unique key for a vehicle
 * @param {number} type - Vehicle type code
 * @param {number} vehicleId - Vehicle ID
 * @returns {string} Unique key string
 */
export function getVehicleKey(type, vehicleId) {
  return `${type}-${vehicleId}`;
}

/**
 * Parse interruptions data into a lookup object
 * @param {Array} rawInterruptions - Raw interruptions array from API
 * @returns {Object} Interruptions keyed by "lineNum-vehicleType-destination"
 */
export function parseInterruptions(rawInterruptions) {
  const interruptions = {};

  for (const data of rawInterruptions) {
    for (const route of data.routes.split(',')) {
      let cleanedRoute = '';
      let destination = '';

      if (route.includes('->')) {
        [cleanedRoute, destination] = route.split('->').map(s => s.trim());
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
 * @param {Object} interruptions - Interruptions lookup object
 * @param {string} lineNum - Line number
 * @param {string} vehicleType - Vehicle type in Estonian
 * @param {string} destination - Trip destination
 * @param {boolean} noLineBreaks - Whether to format without line breaks
 * @returns {Object} {announcement, ongoingInterruption}
 */
export function checkInterruption(interruptions, lineNum, vehicleType, destination, noLineBreaks = false) {
  const wholeInterruptionKey = `${lineNum}-${vehicleType}-both`;
  const partialInterruptionKey = `${lineNum}-${vehicleType}-${destination}`;

  let announcement = '';
  let ongoingInterruption = false;

  if (wholeInterruptionKey in interruptions || partialInterruptionKey in interruptions) {
    const interruption = wholeInterruptionKey in interruptions
      ? interruptions[wholeInterruptionKey]
      : interruptions[partialInterruptionKey];

    const info = interruption.info || '';
    announcement = interruption.announcement || '';

    if (info) {
      announcement = noLineBreaks
        ? info + ' ' + announcement
        : '<br>' + info + '<br>' + announcement;
    }
    ongoingInterruption = true;
  }

  return { announcement, ongoingInterruption };
}
