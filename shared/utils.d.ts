/**
 * Type declarations for shared utils module
 */

export function minutesUntilTime(hhmmss: string, now?: Date): number;
export function formattedScheduledTime(scheduledTime: string, departureTime: string): string;
export function detectDevice(): string;
export function getVehicleIconName(iconType: string, ongoingInterruption: boolean): string;
export function getVehicleKey(type: number, vehicleId: number): string;
export function parseInterruptions(rawInterruptions: any[]): Record<string, any>;
export function checkInterruption(
  interruptions: Record<string, any>,
  lineNum: string,
  vehicleType: string,
  destination: string,
  noLineBreaks?: boolean
): { announcement: string; ongoingInterruption: boolean };
