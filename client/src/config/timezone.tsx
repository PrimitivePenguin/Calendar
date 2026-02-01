import { Temporal } from "@js-temporal/polyfill";

// Default timezone for the application (Pacific Time)
export const DEFAULT_TIMEZONE = 'America/Los_Angeles';

// Get the current time in the default timezone
export const nowInDefaultTimezone = () => {
  return Temporal.Now.zonedDateTimeISO(DEFAULT_TIMEZONE);
};

// Convert an ISO string to local datetime string for form inputs (in PST)
export const toLocalDateTimeString = (isoString: string): string => {
  const instant = Temporal.Instant.from(isoString);
  const zdt = instant.toZonedDateTimeISO(DEFAULT_TIMEZONE);
  const year = zdt.year;
  const month = String(zdt.month).padStart(2, '0');
  const day = String(zdt.day).padStart(2, '0');
  const hour = String(zdt.hour).padStart(2, '0');
  const minute = String(zdt.minute).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

// Convert a local datetime string (from form) to ISO string (stored as UTC)
export const toISOString = (localDateTimeString: string): string => {
  // Parse the local datetime and treat it as being in PST
  const [datePart, timePart] = localDateTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  
  const zdt = Temporal.PlainDateTime.from({
    year, month, day, hour, minute
  }).toZonedDateTime(DEFAULT_TIMEZONE);
  
  return zdt.toInstant().toString();
};