# Smart Campus - Incident Management System
## IT3030 PAF Assignment 2026 (Semester 1)

**Member 3 Implementation**: Maintenance & Incident Ticketing + Attachments + Technician Updates

A complete web application for managing campus facility incidents with image attachments, technician assignment, and comment tracking. Features a modern blue and white theme with smooth animations and responsive design.

---

## 🎯 Project Overview

This is a production-ready incident management system for tracking and resolving facility issues in a university campus. The system includes:

- **Incident Ticket Management**: Create, track, and resolve facility incidents
- **Image Attachments**: Support for up to 3 image attachments per ticket
- **Technician Assignment**: Assign and manage technicians to tickets
- **Comments & Notes**: Add comments with edit/delete ownership rules
- **Ticket Workflow**: OPEN → IN_PROGRESS → RESOLVED → CLOSED → REJECTED
- **Statistics Dashboard**: Track metrics and resolution times
- **Beautiful UI**: Modern blue and white gradient design with animations

---

## 📋 Core Features (Member 3)

### Module C – Maintenance & Incident Ticketing

✅ **Create Incident Tickets**
- Category: ELECTRICAL, PLUMBING, STRUCTURAL, EQUIPMENT, SAFETY
- Priority: HIGH, MEDIUM, LOW, CRITICAL
- Description with title and details
- Contact information from reporter
- Up to 3 image attachments for evidence

✅ **Ticket Workflow**
- Status progression: OPEN → IN_PROGRESS → RESOLVED → CLOSED
- Reject option with reason
- Automatic timestamp tracking
- Resolution notes tracking

✅ **Technician Management**
- Assign/unassign technicians to tickets
- Track assigned technician details
- Filter tickets by technician
- Auto-update status when assigned

✅ **Attachments**
- Upload up to 3 images per ticket
- Validate file types (JPEG, PNG, GIF, WebP)
- Track uploader and upload time
- Remove attachments as needed
- File size limit: 5MB per file

✅ **Comments**
- Add comments to tickets
- Track commenter role (USER, TECHNICIAN, ADMIN)
- Edit comments (owner only)
- Delete comments (owner only)
- Ownership-based access control

✅ **Dashboard**
- Total ticket count
- Status breakdowns
- High priority tickets
- Unassigned tickets
- Average resolution time

---

## 🛠️ REST API Endpoints (14 Total)

### Base URL
```
http://localhost:8081/api
```

### GET Endpoints
- `GET /incidents` - List all tickets with optional filters
- `GET /incidents/{id}` - Get ticket details
- `GET /incidents/filter/open` - Get open tickets
- `GET /incidents/filter/unassigned` - Get unassigned tickets
- `GET /incidents/technician/{technicianId}` - Get technician's tickets
- `GET /incidents/search/by-keyword` - Search tickets
- `GET /incidents/statistics` - Get statistics

### POST Endpoints
- `POST /incidents` - Create incident ticket
- `POST /incidents/{id}/attachments` - Add image attachment
- `POST /incidents/{id}/comments` - Add comment

### PUT Endpoints
- `PUT /incidents/{id}` - Update ticket details
- `PUT /incidents/{id}/comments/{commentId}` - Update comment

### PATCH Endpoints
- `PATCH /incidents/{id}/status` - Update ticket status
- `PATCH /incidents/{id}/assign` - Assign technician

### DELETE Endpoints
- `DELETE /incidents/{id}` - Delete ticket
- `DELETE /incidents/{id}/attachments/{attachmentId}` - Remove attachment
- `DELETE /incidents/{id}/comments/{commentId}` - Delete comment

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.3.0
- **Language**: Java 21
- **Database**: MongoDB
- **Security**: Spring Security
- **Build Tool**: Maven
- **File Upload**: Commons FileUpload

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite
- **Styling**: CSS3 with Gradients & Animations
- **HTTP Client**: Axios
- **Animation**: Framer Motion
- **Icons**: React Icons

---

## 📦 Project Structure

```
smart-campus-incidents-member3/
├── backend/
│   ├── src/main/java/com/smartcampus/incidents/
│   │   ├── controller/         # REST endpoints
│   │   ├── service/            # Business logic
│   │   ├── repository/         # MongoDB data access
│   │   ├── model/              # Entity models
│   │   ├── dto/                # Request/Response DTOs
│   │   └── config/             # Security & CORS config
│   ├── src/main/resources/
│   │   └── application.yml     # Configuration
│   ├── pom.xml                 # Maven dependencies
│   ├── .env                    # Environment variables
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── services/           # API integration
│   │   ├── styles/             # Global CSS
│   │   ├── App.jsx             # Main component
│   │   └── main.jsx            # Entry point
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration
│   ├── package.json            # npm dependencies
│   ├── .env                    # Environment variables
│   └── .gitignore
│
├── README.md                   # This file
├── SETUP_INSTRUCTIONS.md       # Setup guide
└── MEMBER3_FEATURES.md        # Feature details
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Java 21+
- Node.js 16+
- MongoDB (local or cloud)
- Maven

### Step 1: Configure MongoDB

#### Local MongoDB
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
Services > MongoDB Community Server
```

#### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `.env` with URI

### Step 2: Setup Backend

```bash
cd backend

# Update .env
# MONGODB_URI=mongodb://localhost:27017/smart_campus_incidents_db
# API_PORT=8081

# Build
mvn clean install

# Run
mvn spring-boot:run
```

**Backend runs on**: `http://localhost:8081`

### Step 3: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Frontend runs on**: `http://localhost:5174`

---

## 🎨 Design Features

### Blue & White Theme
- Primary Blue: #0066ff
- Sky Blue: #0099ff
- Light Blue: #e6f0ff
- White: #ffffff
- Gray Scale: #f0f2f5 - #1e2228

### Animations
- Page transitions with fade-in
- Card hover effects with lift
- Loading spinners
- Success/error notifications
- Smooth navigation between pages

### Responsive Layout
- Mobile-first design
- Breakpoints: 1200px, 768px, 480px
- Touch-friendly buttons
- Flexible grid layouts

---

## 📋 Database Schema

### Incident Ticket Collection
```javascript
{
  "_id": ObjectId,
  "ticketNumber": String,      // INC-000001
  "facilityId": String,
  "facilityName": String,
  "category": String,          // ELECTRICAL, PLUMBING, etc.
  "title": String,
  "description": String,
  "priority": String,          // HIGH, MEDIUM, LOW, CRITICAL
  "status": String,            // OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
  "rejectionReason": String,
  "reportedBy": String,
  "reportedByEmail": String,
  "reportedByPhone": String,
  "assignedTechnician": String,
  "technicianName": String,
  "resolutionNotes": String,
  "attachments": [
    {
      "id": String,
      "fileName": String,
      "fileUrl": String,
      "fileType": String,
      "fileSize": Number,
      "uploadedBy": String,
      "uploadedAt": DateTime
    }
  ],
  "comments": [
    {
      "id": String,
      "content": String,
      "commentedBy": String,
      "commentedByRole": String,  // USER, TECHNICIAN, ADMIN
      "createdAt": DateTime,
      "updatedAt": DateTime,
      "canEdit": Boolean,
      "canDelete": Boolean
    }
  ],
  "createdAt": DateTime,
  "updatedAt": DateTime,
  "resolvedAt": DateTime,
  "closedAt": DateTime,
  "totalComments": Number,
  "totalAttachments": Number
}
```

---

## 📡 API Usage Examples

### Create Incident Ticket
```bash
curl -X POST http://localhost:8081/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "facilityId": "fac123",
    "facilityName": "Computer Lab A",
    "category": "ELECTRICAL",
    "title": "Power outlet not working",
    "description": "Socket in corner of room 302",
    "priority": "HIGH",
    "reportedBy": "John Doe",
    "reportedByEmail": "john@campus.edu",
    "reportedByPhone": "+94112345678"
  }'
```

### Add Attachment
```bash
curl -X POST http://localhost:8081/api/incidents/{id}/attachments \
  -F "file=@evidence.jpg" \
  -F "uploadedBy=john@campus.edu"
```

### Add Comment
```bash
curl -X POST http://localhost:8081/api/incidents/{id}/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Working on the repair",
    "commentedBy": "technician001",
    "commentedByRole": "TECHNICIAN"
  }'
```

### Update Status
```bash
curl -X PATCH "http://localhost:8081/api/incidents/{id}/status?status=RESOLVED&resolutionNotes=Replaced socket"
```

### Assign Technician
```bash
curl -X PATCH "http://localhost:8081/api/incidents/{id}/assign?technicianId=tech001&technicianName=Ahmed+Silva"
```

---

## 🔒 Security Features

- ✅ Input validation on all endpoints
- ✅ Email and phone format validation
- ✅ File type and size validation
- ✅ CORS protection
- ✅ Spring Security integration
- ✅ Comment ownership rules
- ✅ Attachment upload limits
- ✅ Password encryption ready

---

## 📊 Key Metrics Tracked

| Metric | Description |
|--------|-------------|
| Total Tickets | All incidents in system |
| Open Tickets | Status = OPEN |
| In Progress | Status = IN_PROGRESS |
| Resolved | Status = RESOLVED |
| Closed | Status = CLOSED |
| Rejected | Status = REJECTED |
| High Priority | Priority = HIGH |
| Unassigned | No technician assigned |
| Avg Resolution Time | Hours from OPEN to RESOLVED |

---

## 🧪 Testing the API

### Using Postman
1. Import endpoints from examples above
2. Set variables: `base_url`, `ticket_id`, `technician_id`
3. Test each endpoint

### Using cURL
```bash
# Get all tickets
curl http://localhost:8081/api/incidents

# Get open tickets
curl http://localhost:8081/api/incidents/filter/open

# Search tickets
curl "http://localhost:8081/api/incidents/search/by-keyword?keyword=power"

# Get statistics
curl http://localhost:8081/api/incidents/statistics
```

---

## ⚡ Performance Features

- CSS-only animations (GPU accelerated)
- Lazy-loaded components
- Optimized images
- Minified CSS and JavaScript
- Efficient database queries
- API response caching ready
- Debounced search input
- Pagination support

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify MongoDB is running
- Check connection string in `.env`
- Test with: `mongosh`

### Port Already in Use
```bash
# Backend (8081)
lsof -i :8081
kill -9 <PID>

# Frontend (5174)
lsof -i :5174
kill -9 <PID>
```

### File Upload Issues
- Check file size (max 5MB)
- Verify file type (JPEG, PNG, GIF, WebP)
- Check upload directory permissions
- Ensure max 3 attachments per ticket

### CORS Errors
- Frontend URL must be in CorsConfigurationSource
- Check browser console for blocked origin
- Restart backend after config changes

---

## 📈 Code Quality

- ✅ RESTful API design
- ✅ Layered architecture
- ✅ Input validation
- ✅ Error handling
- ✅ Clean code principles
- ✅ Java 21 features
- ✅ Documented endpoints
- ✅ Git version control

---

## 🎓 Learning Outcomes

By studying this implementation, you will learn:

1. **Spring Boot REST API Development**
   - RESTful endpoint design
   - Request/response handling
   - File upload management
   - Query optimization

2. **MongoDB Integration**
   - Document modeling
   - Custom queries
   - Nested document handling
   - Array operations

3. **React Development**
   - Component composition
   - State management
   - File handling
   - API integration

4. **Full-Stack Architecture**
   - Frontend-backend communication
   - Database design
   - Security considerations
   - Error handling

---

## 📄 Assignment Requirements Compliance

- ✅ Incident tickets with metadata
- ✅ Image attachments (up to 3)
- ✅ Ticket workflow (OPEN → RESOLVED → CLOSED)
- ✅ Technician assignment and updates
- ✅ Comments with ownership rules
- ✅ 4+ REST endpoints with different HTTP methods
- ✅ Input validation and error handling
- ✅ Security configuration
- ✅ Git version control
- ✅ Responsive UI with animations
- ✅ Comprehensive documentation

---

## 🤝 Individual Contribution

Each commit should reflect individual work:
- Implement your endpoints
- Add your database queries
- Design your UI components
- Document your code
- Commit regularly with meaningful messages

---

## 📧 Support & Questions

For issues:
1. Check SETUP_INSTRUCTIONS.md
2. Review API examples above
3. Check browser console (F12)
4. Check backend logs
5. Verify environment variables

