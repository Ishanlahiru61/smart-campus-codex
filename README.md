# Smart Campus Management System

A comprehensive platform designed to streamline campus operations, including facility booking, incident reporting, and real-time notifications.

##  Key Features

- **Facility Booking**: Real-time availability check and booking system for campus resources.
- **Incident Reporting**: Ticket-based system for reporting and tracking maintenance issues.
- **Real-time Notifications**: Instant updates via WebSockets for booking statuses and ticket updates.
- **Admin Dashboard**: Advanced analytics and user management for campus administrators.
- **Role-based Access**: Specialized views for Students/Staff, Technicians, and Admins.


## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot (Java)
- **Security**: Spring Security + JWT + OAuth2
- **Database**: MongoDB (via Spring Data MongoDB)
- **Real-time**: WebSockets (STOMP)
- **Cloud Storage**: Cloudinary (for images/attachments)

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4
- **State Management**: Context API
- **Charts**: Recharts
- **Icons**: Lucide React

##  Getting Started

### Prerequisites
- JDK 17+
- Node.js 20+
- MongoDB instance

### Backend Setup
1. Navigate to the `backend` directory.
2. Configure your `application.properties` or environment variables (MongoDB URI, Cloudinary credentials).
3. Run `./mvnw spring-boot:run`.

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Run `npm install`.
3. Run `npm run dev`.

### 👥 Team Members

This project was developed by the following team members:

- DISSANAYAKA D.M.I.L.
- ARIYARATHNA M.L.
- NAURUNNA L.A.D.P.
- RANASINGHE I.V.L.


© 2026 Smart Campus Project Team
