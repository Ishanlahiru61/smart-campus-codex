export const DEMO_USER_ID = "user1";

export function combineDateAndTime(date, time) {
  if (!date || !time) return "";
  return `${date}T${time}:00`;
}

export function formatDateTime(value) {
  if (!value || typeof value !== "string") return "-";
  return value.replace("T", " ").slice(0, 16);
}

export function getStatusClassName(status) {
  switch (status) {
    case "APPROVED":
      return "booking-status booking-status--approved";
    case "PENDING":
      return "booking-status booking-status--pending";
    case "REJECTED":
      return "booking-status booking-status--rejected";
    case "CANCELLED":
      return "booking-status booking-status--cancelled";
    default:
      return "booking-status";
  }
}