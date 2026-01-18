// Shared types and constants for the classroom tool application.

export const DAYS_ZH = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

export interface BroadcastTemplate {
  id: string;
  btnName: string;
  title: string;
  subtitle: string;
}

export interface TimeSlot {
  id: string;
  name: string;
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

export interface TimetableData {
  [day: number]: {
    [slotId: string]: string;
  };
}
