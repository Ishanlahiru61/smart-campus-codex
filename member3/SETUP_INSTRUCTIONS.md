# Smart Campus - Incidents - Detailed Setup Instructions
## IT3030 PAF Assignment 2026

---

## 📋 Prerequisites Checklist

- [ ] Java 21 JDK installed
- [ ] Maven 3.8+ installed
- [ ] Node.js 16+ and npm installed
- [ ] MongoDB installed or cloud account
- [ ] Git installed
- [ ] Text editor or IDE (VS Code, IntelliJ, etc.)

---

## 1️⃣ Verify Java 21 Installation

```bash
# Check Java version (should show 21.x)
java --version

# Should output something like:
# java 21.0.9 2025-10-21 LTS
# Java(TM) SE Runtime Environment (build 21.0.9+7-LTS-338)
```

If not installed:
- Download from: https://www.oracle.com/java/technologies/downloads/
- Or use package manager:
  ```bash
  # macOS
  brew install openjdk@21
  
  # Ubuntu/Debian
  sudo apt-get install openjdk-21-jdk
  ```

---

## 2️⃣ Verify Maven Installation

```bash
# Check Maven version
mvn -version

# Should show version 3.8+
```

If not installed:
```bash
# macOS
brew install maven

# Ubuntu/Debian
sudo apt-get install maven

# Or download from: https://maven.apache.org/download.cgi
```

---

## 3️⃣ Verify Node.js Installation

```bash
# Check Node version (should be 16+)
node -v

# Check npm version
npm -v
```

If not installed:
- Visit: https://nodejs.org/
- Download LTS version
- Follow installation wizard

---

## 4️⃣ MongoDB Setup

### Option A: Local MongoDB (Recommended for Development)

#### macOS
```bash
# Install
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify running
brew services list

# Connect to verify
mongosh
# Type: show dbs
# Type: exit
```

#### Windows
1. Download: https://www.mongodb.com/try/download/community
2. Run installer (.msi)
3. Choose "Install MongoDB as a Service"
4. MongoDB starts automatically
5. Verify: Open Command Prompt
   ```bash
   mongosh
   ```

#### Linux (Ubuntu/Debian)
```bash
# Install
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongosh
```

### Option B: MongoDB Atlas (Cloud)

1. Visit: https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create organization
4. Create free tier cluster (M0)
5. Set database user credentials
6. Get connection string
7. Copy to backend `.env` file

Connection string format:
```
mongodb+srv://username:password@cluster.mongodb.net/smart_campus_incidents_db?retryWrites=true&w=majority
```

---

## 5️⃣ Backend Setup (Member 3)

### Step 1: Navigate to Backend

```bash
cd backend
```

### Step 2: Configure Environment

Create or update `.env` file in `backend/` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/smart_campus_incidents_db

# For MongoDB Atlas, use:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/smart_campus_incidents_db?retryWrites=true&w=majority

# Server Configuration
API_PORT=8081

# JWT Configuration
JWT_SECRET=smart-campus-incidents-secret-key-change-this-in-production
JWT_EXPIRATION=86400000

# File Upload
UPLOAD_DIR=./uploads

# Application Profile
SPRING_PROFILES_ACTIVE=dev
```

### Step 3: Build Backend

```bash
# Clean and install
mvn clean install

# Or skip tests if needed
mvn clean install -DskipTests
```

Expected output:
```
[INFO] BUILD SUCCESS
```

### Step 4: Run Backend

#### Option A: Maven
```bash
mvn spring-boot:run
```

#### Option B: JAR File
```bash
# Build JAR
mvn clean package -DskipTests

# Run JAR
java -jar target/incidents-api-1.0.0.jar
```

#### Option C: IDE
- Open project in IntelliJ IDEA or VS Code
- Run `SmartCampusIncidentsApplication.java`

### Verify Backend Running

Open browser or terminal:
```bash
# Should return JSON response
curl -X GET http://localhost:8081/api/incidents

# Expected response:
# {"success":true,"message":"Tickets retrieved successfully","data":[],"count":0}
```

---

## 6️⃣ Frontend Setup (Member 3)

### Step 1: Navigate to Frontend

```bash
cd frontend
```

### Step 2: Configure Environment

Update `.env` file in `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_APP_NAME=Smart Campus - Incident Management
VITE_API_TIMEOUT=30000
```

### Step 3: Install Dependencies

```bash
npm install

# Or using yarn
yarn install
```

Wait for installation to complete (may take 2-3 minutes).

### Step 4: Start Development Server

```bash
npm run dev

# Or using yarn
yarn dev
```

Frontend will automatically open at: **http://localhost:5174**

### Step 5 (Optional): Build for Production

```bash
npm run build

# Preview production build
npm run preview
```

---

## 🚀 Complete Startup Sequence

### Open Terminal 1 - MongoDB
```bash
# If using local MongoDB
mongosh

# Or if installed as service, no need to start manually
# Just verify: mongosh shows connection
```

### Open Terminal 2 - Backend
```bash
cd backend
mvn spring-boot:run

# Wait for message:
# Tomcat started on port(s): 8081
```

### Open Terminal 3 - Frontend
```bash
cd frontend
npm run dev

# Browser will open automatically at:
# http://localhost:5174
```

---

## 🧪 Test the Application

### Test Backend API

```bash
# Get all tickets (should be empty initially)
curl -X GET http://localhost:8081/api/incidents

# Create a ticket
curl -X POST http://localhost:8081/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "facilityId": "fac001",
    "facilityName": "Lab A",
    "category": "ELECTRICAL",
    "title": "Power issue",
    "description": "Socket not working",
    "priority": "HIGH",
    "reportedBy": "Admin",
    "reportedByEmail": "admin@campus.edu",
    "reportedByPhone": "+94112345678"
  }'

# Should return created ticket with ID

# Get statistics
curl -X GET http://localhost:8081/api/incidents/statistics
```

### Test Frontend UI

1. Open http://localhost:5174 in browser
2. Click **Dashboard** - see statistics
3. Click **Tickets** - see list (initially empty)
4. Click **New Ticket** - create incident
5. Fill form and submit
6. Ticket appears in list
7. Click ticket to view details
8. Add attachments and comments
9. Update status to IN_PROGRESS
10. Assign technician
11. Mark as RESOLVED

---

## 🔧 Configuration Details

### Backend Application Properties
Located in: `backend/src/main/resources/application.yml`

### Frontend Environment Variables
Located in: `frontend/.env`

### File Upload Configuration
- Max file size: 5MB per file
- Max files per ticket: 3
- Allowed types: JPEG, PNG, GIF, WebP
- Upload directory: `./uploads/incidents`

---

## 🐛 Troubleshooting

### Java Version Error
```
Error: This version of Spring Boot requires Java 21+
```

**Solution:**
```bash
# Set JAVA_HOME
export JAVA_HOME=/path/to/java-21

# Or verify default Java
java -version
```

### Maven Build Fails
```
[ERROR] COMPILATION ERROR
```

**Solutions:**
```bash
# Update Maven
mvn -U clean install

# Clear cache
rm -rf ~/.m2/repository
mvn clean install

# Check Java compatibility
javac -version
```

### MongoDB Connection Error
```
MongoSocketOpenException: Exception opening socket
```

**Solutions:**
- Verify MongoDB is running: `mongosh`
- Check connection string in `.env`
- For Atlas, ensure network access is allowed
- Check database name matches

### Port Already in Use

#### Backend (8081)
```bash
# Find process
lsof -i :8081

# Kill process (replace PID)
kill -9 <PID>

# Or change port in .env
API_PORT=8082
```

#### Frontend (5174)
```bash
# Find process
lsof -i :5174

# Kill process
kill -9 <PID>

# Or port changes automatically if 5174 is busy
```

### Node Modules Issues
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Error in Frontend
```
Access to XMLHttpRequest at 'http://localhost:8081/api' 
from origin 'http://localhost:5174' has been blocked by CORS policy
```

**Solution:**
- Ensure backend CORS is configured
- Check allowed origins include `http://localhost:5174`
- Restart backend if you changed CORS config

### File Upload Not Working
```
File upload failed
```

**Check:**
- File size < 5MB
- File type is image (JPEG, PNG, GIF, WebP)
- `./uploads/incidents` directory exists
- Directory has write permissions
- Max 3 attachments per ticket

---

## ✅ Setup Verification Checklist

Run this checklist to verify everything is working:

- [ ] Java 21 is installed: `java -version` shows 21.x
- [ ] Maven is installed: `mvn -version` shows 3.8+
- [ ] Node.js is installed: `node -v` shows 16+
- [ ] npm is installed: `npm -v` shows 8+
- [ ] MongoDB is running: `mongosh` connects successfully
- [ ] Backend builds: `mvn clean install` succeeds
- [ ] Backend starts: `mvn spring-boot:run` shows "Tomcat started on port 8081"
- [ ] Frontend builds: `npm install` completes without errors
- [ ] Frontend starts: `npm run dev` opens browser at 5174
- [ ] API responds: `curl http://localhost:8081/api/incidents` returns JSON
- [ ] Can create ticket: Frontend form submission works
- [ ] Can view ticket: Ticket appears in list and details page

---

## 📝 Common Configuration Changes

### Change API Port
**File:** `backend/.env`
```env
API_PORT=8082
```

### Change Frontend Port
**File:** `frontend/vite.config.js`
```javascript
server: {
  port: 3000,  // Change from 5174
}
```

### Change Database
**File:** `backend/.env`
```env
# Local
MONGODB_URI=mongodb://localhost:27017/smart_campus_incidents_db

# Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true
```

### Change Log Levels
**File:** `backend/src/main/resources/application.yml`
```yaml
logging:
  level:
    root: INFO
    com.smartcampus: DEBUG
```

---

## 📚 Useful Resources

- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **MongoDB Docs**: https://docs.mongodb.com
- **Maven Guide**: https://maven.apache.org/guides/

---

## 🎯 Next Steps

1. ✅ Complete setup using instructions above
2. ✅ Verify all services running
3. ✅ Test API endpoints
4. ✅ Test frontend UI
5. ✅ Create sample incidents
6. ✅ Test all features
7. ✅ Review code and documentation
8. ✅ Prepare for viva presentation

---

**Setup Complete!** 🎉

Your Member 3 Incident Management System is ready to use.

**Access Points:**
- Frontend: http://localhost:5174
- Backend API: http://localhost:8081/api
- MongoDB: mongodb://localhost:27017

Good luck with your assignment! 🚀
