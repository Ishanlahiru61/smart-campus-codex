import java.time.LocalDateTime;
import java.time.LocalTime;

public class scratch {
    public static void main(String[] args) {
        LocalDateTime start = LocalDateTime.parse("2026-04-27T10:00:00");
        LocalDateTime end = LocalDateTime.parse("2026-04-27T12:00:00");
        
        String windowDayOfWeek = "MONDAY";
        String windowStartTime = "08:00";
        String windowEndTime = "17:00";
        
        String dayOfWeek = start.getDayOfWeek().name();
        
        LocalTime windowStart = LocalTime.parse(windowStartTime);
        LocalTime windowEnd = LocalTime.parse(windowEndTime);

        LocalTime bookingStart = start.toLocalTime();
        LocalTime bookingEnd = end.toLocalTime();

        System.out.println("Checking window: " + windowDayOfWeek + " " + windowStartTime + "-" + windowEndTime);
        System.out.println("Booking start: " + start.getDayOfWeek() + " " + bookingStart);
        System.out.println("Booking end: " + end.getDayOfWeek() + " " + bookingEnd);

        boolean isDayMatch = dayOfWeek.equalsIgnoreCase(windowDayOfWeek) && end.getDayOfWeek().name().equalsIgnoreCase(windowDayOfWeek);
        boolean isTimeMatch = !bookingStart.isBefore(windowStart) && !bookingEnd.isAfter(windowEnd);

        System.out.println("isDayMatch: " + isDayMatch + ", isTimeMatch: " + isTimeMatch);
        System.out.println("Result: " + (isDayMatch && isTimeMatch));
    }
}
