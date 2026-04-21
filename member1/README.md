# Smart Campus - Facilities Management System
## IT3030 PAF Assignment 2026 (Semester 1)

**Member 1 Implementation**: Facilities Catalogue + Resource Management Endpoints

A complete web application for managing university campus facilities and resources with an attractive modern UI, RESTful API architecture, and MongoDB integration.

---

## 🎯 Project Overview

This is a production-inspired web system for managing facility and asset bookings in a university campus. The system includes:

- **Facilities Catalogue**: Browse, search, and filter available resources (lecture halls, labs, meeting rooms, equipment)
- **Resource Management**: Create, read, update, delete facility records
- **Advanced Filtering**: Filter by type, status, location, and capacity
- **Beautiful UI**: Modern gradient design with smooth animations and floating effects
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

---

## 📋 Core Features (Member 1)

### Module A – Facilities & Assets Catalogue
- ✅ Maintain a catalogue of bookable resources
- ✅ Key metadata: type, capacity, location, availability windows, status
- ✅ Search and filter functionality
- ✅ Resource status management (ACTIVE, OUT_OF_SERVICE, MAINTENANCE)

### REST API Endpoints (4+ with different HTTP methods)
- **GET** `/api/facilities` - Retrieve all facilities with optional filters
- **GET** `/api/facilities/{id}` - Get specific facility details
- **POST** `/api/facilities` - Create new facility
- **PUT** `/api/facilities/{id}` - Update existing facility
- **DELETE** `/api/facilities/{id}` - Remove facility
- **GET** `/api/facilities/search/by-name` - Search by name
- **GET** `/api/facilities/available` - Find available facilities
- **PATCH** `/api/facilities/{id}/status` - Update facility status
- **GET** `/api/facilities/statistics` - Get statistics dashboard

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: MongoDB
- **Security**: Spring Security
- **Build Tool**: Maven

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
it3030-paf-2026-smart-campus-member1/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/smartcampus/facilities/
│   │       │   ├── SmartCampusFacilitiesApplication.java
│   │       │   ├── controller/FacilityController.java
│   │       │   ├── service/FacilityService.java
│   │       │   ├── repository/FacilityRepository.java
│   │       │   ├── model/Facility.java
│   │       │   ├── dto/FacilityRequestDTO.java
│   │       │   └── config/SecurityConfig.java
│   │       └── resources/
│   │           └── application.yml
│   ├── pom.xml
│   ├── .env
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.jsx & Navigation.css
│   │   │   ├── Dashboard.jsx & Dashboard.css
│   │   │   ├── FacilitiesList.jsx & FacilitiesList.css
│   │   │   ├── FacilityForm.jsx & FacilityForm.css
│   │   │   └── FacilityDetails.jsx & FacilityDetails.css
│   │   ├── services/api.js
│   │   ├── styles/global.css
│   │   ├── App.jsx & App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env
│   └── .gitignore
├── README.md
└── SETUP_INSTRUCTIONS.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Java 17+
- Node.js 16+
- MongoDB (local or cloud)
- Git

### Step 1: Clone/Extract Repository
```bash
# Extract the zip file
unzip it3030-paf-2026-smart-campus-member1.zip
cd it3030-paf-2026-smart-campus-member1
```

### Step 2: Configure MongoDB

#### Option A: Local MongoDB
```bash
# Install MongoDB Community Edition
# macOS:
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB:
brew services start mongodb-community
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `.env` file with your connection string

### Step 3: Setup Backend

```bash
cd backend

# Update .env file with MongoDB connection
# MONGODB_URI=mongodb://localhost:27017/smart_campus_db
# API_PORT=8080

# Build and run with Maven
mvn clean install
mvn spring-boot:run

# Or compile and run JAR
mvn package
java -jar target/facilities-api-1.0.0.jar
```

**Backend will run on**: `http://localhost:8080`

### Step 4: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Update .env if needed
# VITE_API_BASE_URL=http://localhost:8080/api

# Start development server
npm run dev

# Or build for production
npm run build
npm run preview
```

**Frontend will run on**: `http://localhost:5173`

---

## 🎨 UI/UX Highlights

### Design Features
- **Gradient Colors**: Beautiful purple-to-pink gradient theme with multiple variations
- **Smooth Animations**: Page transitions, card hover effects, floating elements
- **Responsive Layout**: Adapts seamlessly to all screen sizes
- **Modern Components**: Cards, modals, forms with interactive elements
- **Accessibility**: Semantic HTML, keyboard navigation, proper contrast ratios

### Key Pages
1. **Dashboard**: Overview with statistics and quick actions
2. **Facilities List**: Grid view with search, filter, and action buttons
3. **Facility Form**: Create/edit facilities with validation
4. **Facility Details**: Comprehensive facility information page

---

## 📡 API Endpoints Reference

### Base URL
```
http://localhost:8080/api
```

### Facilities Management

#### Get All Facilities
```http
GET /facilities
GET /facilities?type=LECTURE_HALL
GET /facilities?location=Building%20A
GET /facilities?status=ACTIVE
```

#### Get Facility by ID
```http
GET /facilities/{id}
```

#### Create Facility
```http
POST /facilities
Content-Type: application/json

{
  "name": "Main Auditorium",
  "type": "LECTURE_HALL",
  "capacity": 500,
  "location": "Building A, Ground Floor",
  "description": "Large lecture hall",
  "status": "ACTIVE",
  "amenities": ["projector", "sound system", "ac"],
  "floorNumber": 0,
  "buildingCode": "BLD-A",
  "contactPerson": "John Doe",
  "contactEmail": "john@campus.edu",
  "contactPhone": "+94112345678",
  "costPerHour": 500,
  "requiresApproval": false
}
```

#### Update Facility
```http
PUT /facilities/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "capacity": 600,
  ...
}
```

#### Delete Facility
```http
DELETE /facilities/{id}
```

#### Search by Name
```http
GET /facilities/search/by-name?name=auditorium
```

#### Find Available Facilities
```http
GET /facilities/available?type=LECTURE_HALL&capacity=100
```

#### Update Status
```http
PATCH /facilities/{id}/status?status=MAINTENANCE
```

#### Get Statistics
```http
GET /facilities/statistics
```

---

## 🗄️ Database Schema

### Facility Collection (MongoDB)
```javascript
{
  "_id": ObjectId,
  "name": String,
  "type": "LECTURE_HALL|LAB|MEETING_ROOM|EQUIPMENT",
  "capacity": Number,
  "location": String,
  "description": String,
  "status": "ACTIVE|OUT_OF_SERVICE|MAINTENANCE",
  "amenities": [String],
  "latitude": Double,
  "longitude": Double,
  "floorNumber": Number,
  "buildingCode": String,
  "contactPerson": String,
  "contactEmail": String,
  "contactPhone": String,
  "availabilityWindows": [
    {
      "dayOfWeek": String,
      "startTime": String,
      "endTime": String
    }
  ],
  "costPerHour": Double,
  "requiresApproval": Boolean,
  "imageUrl": String,
  "createdAt": DateTime,
  "updatedAt": DateTime,
  "createdBy": String,
  "updatedBy": String,
  "totalBookings": Number,
  "averageRating": Double
}
```

---

## ✅ Testing the API

### Using Postman
1. Import collection from `backend/postman-collection.json`
2. Set variables: `base_url`, `facility_id`
3. Run requests

### Using cURL
```bash
# Get all facilities
curl -X GET http://localhost:8080/api/facilities

# Create facility
curl -X POST http://localhost:8080/api/facilities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lab",
    "type": "LAB",
    "capacity": 30,
    "location": "Building B",
    "status": "ACTIVE"
  }'

# Update facility
curl -X PUT http://localhost:8080/api/facilities/{id} \
  -H "Content-Type: application/json" \
  -d '{"capacity": 40}'

# Delete facility
curl -X DELETE http://localhost:8080/api/facilities/{id}
```

---

## 🔒 Security Features

- ✅ Spring Security integration
- ✅ CORS configuration for localhost
- ✅ Input validation on all endpoints
- ✅ Error handling and meaningful error messages
- ✅ Role-based access control preparation
- ✅ Password encryption ready (BCryptPasswordEncoder)

---

## 📝 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/smart_campus_db
API_PORT=8080
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=86400000
SPRING_PROFILES_ACTIVE=dev
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Smart Campus - Facilities Management
VITE_API_TIMEOUT=30000
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Check if MongoDB is running:
- Windows: Services > MongoDB Community Server
- macOS: brew services list
- Linux: sudo systemctl status mongod
```



### CORS Issues
- Frontend URL must be in `CorsConfigurationSource` in backend
- Check network tab in browser DevTools

### API Calls Timing Out
- Increase `VITE_API_TIMEOUT` in frontend .env
- Check if backend is running
- Verify MongoDB connection

---

## 📊 Code Quality

- ✅ RESTful API design best practices
- ✅ Layered architecture (Controller → Service → Repository)
- ✅ Input validation with Jakarta validation
- ✅ Proper error handling with meaningful messages
- ✅ Clean, readable code with proper naming conventions
- ✅ Comments and documentation
- ✅ Git version control with meaningful commits

---

## 🎓 Learning Outcomes

By implementing this assignment, you will learn:

1. **Backend**: Spring Boot REST API development, MongoDB integration, API design
2. **Frontend**: React components, state management, API consumption, modern UI design
3. **Full-Stack**: Integration between frontend and backend, deployment considerations
4. **DevOps**: Git version control, environment configuration, build tools
5. **Software Engineering**: Architecture patterns, validation, error handling, testing

---

## 📄 Assignment Requirements Checklist

- ✅ Requirements identified (functional & non-functional)
- ✅ Architecture diagrams created
- ✅ Spring Boot REST API with layered architecture
- ✅ React web application with attractive UI
- ✅ MongoDB database integration
- ✅ Git repository with commit history
- ✅ GitHub Actions workflow (optional)
- ✅ 4+ REST endpoints with different HTTP methods
- ✅ Input validation and error handling
- ✅ Security best practices
- ✅ Clean, maintainable code
- ✅ UI/UX quality and responsiveness
- ✅ README and setup instructions
- ✅ Member 1 contribution clearly documented

---

## 🤝 Contributing

This is an individual assessment. Ensure:
- Each commit reflects true individual work
- Code comments indicate your understanding
- Be able to explain your implementation in viva

---

## 📧 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API error messages
3. Check browser console for client-side errors
4. Check backend logs for server-side errors

---

## 📜 License

Academic use only - Faculty of Computing, SLIIT

---

## ✨ Credits

- **Student**: Member 1
- **Course**: IT3030 - Programming Applications and Frameworks
- **Institution**: Sri Lanka Institute of Information Technology (SLIIT)
- **Semester**: 1, 2026

---

