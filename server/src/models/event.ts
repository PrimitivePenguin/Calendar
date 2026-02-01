export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;  // ISO 8601 format
  endDate: string;    // ISO 8601 format
  allDay: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDTO {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  color?: string;
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  allDay?: boolean;
  color?: string;
}