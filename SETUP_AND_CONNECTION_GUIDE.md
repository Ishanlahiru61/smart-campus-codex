# 🚀 Setup & Connection Guide - Smart Campus

## ✅ Prerequisites

### Required Software:
- ✅ Node.js (v16+) - For frontend
- ✅ Java 17 - For backend
- ✅ Maven 3.6+ - For backend
- ✅ MongoDB Atlas Account - For database
- ✅ Git - For version control

### Port Availability:
- ✅ Port 5173 - Frontend (Vite)
- ✅ Port 8081 - Backend (Spring Boot)
- ✅ Port 27017 - MongoDB (if local) - Not needed, using MongoDB Atlas

---

## 🔧 Initial Setup

### Step 1: Clone Repository

```bash
# Navigate to desired directory
cd /path/to/workspace

# Clone the repository
git clone https://github.com/your-repo/smart-campus-codex.git
cd smart-campus-codex
```

### Step 2: Backend Setup

#### 2.1 Update Backend Configuration

**File:** `backend/src/main/resources/application.properties`

```properties
# Server Port (Changed from 8080 to 8081 to avoid conflicts)
server.port=8081

# MongoDB Connection
spring.data.mongodb.uri=mongodb+srv://ishan:ishan%401234@cluster4.n226at2.mongodb.net/SmartCampusDB?appName=Cluster4

# Encryption & JWT Settings
app.encryption.key=SmartCampusKey12
jwt.secret=4r685b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6
jwt.expiration=86400000
```

#### 2.2 Build Backend

```bash
# Navigate to backend
cd backend

# Build project
mvn clean install

# OR build and skip tests
mvn clean install -DskipTests
```

#### 2.3 Run Backend

```bash
# Start the Spring Boot application
mvn spring-boot:run

# You should see:
# Started SmartCampusApplication in XX.XXX seconds
# Server running on: http://localhost:8081
```

**Verify Backend:**
```bash
# Open browser and test endpoint
curl http://localhost:8081/facilities
# Should return JSON response (even if empty)
```

---

### Step 3: Frontend Setup

#### 3.1 Install Dependencies

```bash
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install
```

#### 3.2 Verify Environment Files

The following files should exist (already created):

**`frontend/.env`** (Development):
```env
VITE_API_BASE_URL=http://localhost:8081
VITE_API_TIMEOUT=30000
```

**`frontend/.env.development`** (Optional explicit development):
```env
VITE_API_BASE_URL=http://localhost:8081
VITE_API_TIMEOUT=30000
```

**`frontend/.env.production`** (Production):
```env
VITE_API_BASE_URL=https://api.smartcampus.com
VITE_API_TIMEOUT=30000
```

#### 3.3 Run Frontend

```bash
# Start development server
npm run dev

# You should see:
# VITE v8.0.9 ready in XXX ms
# 
# ➜ Local: http://localhost:5173/
# ➜ press h to show help
```

**Verify Frontend:**
- Open browser: `http://localhost:5173`
- Should see the dashboard
- No CORS errors in console

---

## 🧪 Testing the Connection

### Test 1: Check API Connectivity

```bash
# In browser console (DevTools → Console)

# Test API call
fetch('http://localhost:8081/facilities')
  .then(r => r.json())
  .then(d => console.log(d))

# Expected output:
# {
#   "success": true,
#   "message": "Facilities retrieved successfully",
#   "data": [],
#   "count": 0
# }
```

### Test 2: Check Frontend-Backend Communication

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Click "Facilities" in navigation**
4. **Look for network requests:**
   - Should see request to `/facilities`
   - Status should be `200 OK`
   - Response should have `success: true`

### Test 3: Create a Facility

1. **Click "New Facility"** in app
2. **Fill in form:**
   - Name: "Test Lab"
   - Type: "LAB"
   - Capacity: 30
   - Location: "Building A"
   - Status: "ACTIVE"
3. **Click Submit**
4. **Verify:**
   - Facility appears in list
   - No error messages
   - Network tab shows `POST 201 CREATED`

### Test 4: Search Facilities

1. **Go to Facilities List**
2. **Type in search box**: "test"
3. **Verify:**
   - Results filtered
   - Network request: `GET /facilities/search/by-name?name=test`
   - Response shows matching facilities

---

## 🔍 Troubleshooting

### Issue 1: CORS Error
```
Access to XMLHttpRequest from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution:**
- Ensure backend is running on port 8081
- Verify `@CrossOrigin(origins = {"http://localhost:5173"})` in FacilityController
- Check browser is accessing `http://localhost:5173` (not `localhost:5173`)
- Clear browser cache and restart both servers

### Issue 2: Connection Refused
```
Failed to fetch (Connection refused)
```

**Solution:**
- Verify backend is running: `http://localhost:8081/facilities`
- Check `.env` file has: `VITE_API_BASE_URL=http://localhost:8081`
- Restart Vite dev server: `npm run dev`
- Ensure no firewall blocking port 8081

### Issue 3: Network Request to 8080 Instead of 8081
```
Request to: http://localhost:8080/api/facilities
Error: Connection refused
```

**Solution:**
- Check `.env` file content
- Verify it says: `VITE_API_BASE_URL=http://localhost:8081`
- Stop Vite dev server
- Stop npm process
- Restart: `npm run dev`
- Check DevTools Network tab for new requests

### Issue 4: MongoDB Connection Error
```
Error: connect ECONNREFUSED
```

**Solution:**
- Verify MongoDB Atlas credentials in `application.properties`
- Check internet connection (MongoDB Atlas requires internet)
- Ensure IP whitelist includes your IP
- Check database URI format: `mongodb+srv://user:password@cluster.mongodb.net/DbName`

### Issue 5: Form Validation Errors
```
400 Bad Request - Validation error
```

**Solution:**
- Check form data matches model (e.g., email format, phone format)
- Email should be valid format: `user@example.com`
- Phone should be 10+ digits: `1234567890`
- Capacity should be positive integer: `> 0`

---

## 📊 Configuration Reference

### Frontend Environment Variables

| Variable | Default | Example | Purpose |
|----------|---------|---------|---------|
| VITE_API_BASE_URL | N/A | http://localhost:8081 | Backend API base URL |
| VITE_API_TIMEOUT | 30000 | 30000 | API request timeout (ms) |

### Backend Properties

| Property | Default | Example | Purpose |
|----------|---------|---------|---------|
| server.port | 8081 | 8081 | Backend server port |
| spring.data.mongodb.uri | N/A | mongodb+srv://... | MongoDB connection string |
| jwt.secret | N/A | random-key | JWT signing secret |
| jwt.expiration | 86400000 | 86400000 | JWT expiration (ms) |

### Vite Configuration

```javascript
server: {
  port: 5173,                           // Dev server port
  proxy: {
    '/api': {
      target: 'http://localhost:8081',  // Backend URL
      changeOrigin: true,               // Change request origin header
      rewrite: (path) =>                // Rewrite path
        path.replace(/^\/api/, '')
    }
  }
}
```

---

## 🚀 Running in Production

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Output: dist/ folder ready to deploy

# Build backend
cd backend
mvn clean package -DskipTests

# Output: target/smart-campus-backend-0.0.1-SNAPSHOT.jar
```

### Production Deployment

#### Frontend:
1. Build: `npm run build` → Creates `dist/`
2. Deploy `dist/` folder to:
   - AWS S3 + CloudFront
   - Vercel
   - Netlify
   - GitHub Pages
   - Your own server

#### Backend:
1. Build: `mvn clean package` → Creates `.jar`
2. Deploy to:
   - AWS EC2 / Elastic Beanstalk
   - Heroku
   - Google Cloud Run
   - Azure App Service
   - Your own server

#### Environment Variables:
**Production `.env`:**
```env
VITE_API_BASE_URL=https://api.smartcampus.com
VITE_API_TIMEOUT=30000
```

**Production `application.properties`:**
```properties
server.port=8080
spring.data.mongodb.uri=mongodb+srv://prod-user:prod-password@prod-cluster.mongodb.net/SmartCampusDB
jwt.secret=production-secret-key-here
```

---

## 📋 Complete Startup Checklist

Before starting, verify:

- [ ] Node.js installed: `node --version`
- [ ] Java 17 installed: `java -version`
- [ ] Maven installed: `mvn --version`
- [ ] MongoDB Atlas account created
- [ ] Repository cloned
- [ ] Backend `application.properties` configured
- [ ] Frontend `.env` file exists with correct URL
- [ ] Port 5173 available
- [ ] Port 8081 available
- [ ] Internet connection (for MongoDB Atlas)

---

## ✅ Startup Sequence

### Terminal 1: Backend

```bash
cd backend
mvn spring-boot:run

# Wait for: Started SmartCampusApplication in XX.XXX seconds
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev

# Wait for: Local: http://localhost:5173/
```

### Browser

```
1. Open: http://localhost:5173
2. Wait for app to load
3. Check DevTools → Console for errors
4. Check DevTools → Network for successful API calls
5. Test features:
   - Dashboard loads
   - Facilities list appears
   - Search works
   - Can create facility
```

---

## 🎯 Development Workflow

### Making Changes

```bash
# Backend changes
1. Edit Java files
2. Maven auto-reloads OR stop/restart mvn spring-boot:run

# Frontend changes
1. Edit React files
2. Vite auto-reloads browser

# No restarts needed - hot reload working!
```

### Testing Endpoints Manually

```bash
# Get all facilities
curl http://localhost:8081/facilities

# Get specific facility
curl http://localhost:8081/facilities/{id}

# Create facility
curl -X POST http://localhost:8081/facilities \
  -H "Content-Type: application/json" \
  -d '{"name":"Lab A","type":"LAB","capacity":30}'

# Search facilities
curl "http://localhost:8081/facilities/search/by-name?name=Lab"
```

---

## 📞 Support & Resources

### Common Ports Used:
- **5173** - Frontend (Vite)
- **8081** - Backend (Spring Boot)
- **27017** - MongoDB (Local) - Not needed

### Useful Commands:

```bash
# Kill process on specific port (macOS/Linux)
lsof -ti:5173 | xargs kill -9

# Kill process on specific port (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force

# Check if port is in use
netstat -ano | findstr :8081
```

---

## ✅ Status: READY FOR DEVELOPMENT

All configurations are set up correctly. The frontend and backend are properly connected and ready for development.

**Next Steps:**
1. Follow the startup sequence above
2. Test connectivity using the testing steps
3. Start developing features
4. Refer to component documentation for feature development

---

**Happy Coding! 🚀**
