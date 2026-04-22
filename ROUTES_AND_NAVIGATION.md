# Frontend Routes & Navigation Structure

## 🗺️ Complete Navigation Map

### Route Structure

```
App (Main Component)
│
├── Navigation (Top Navigation Bar)
│   │
│   └── Routes:
│       ├── Dashboard
│       ├── Facilities (List)
│       └── New Facility (Form)
│
└── Main Content (Rendered based on currentPage)
    │
    ├── PAGE: "dashboard"
    │   └── Component: <Dashboard />
    │       └── Props: { facilities, onNavigate }
    │
    ├── PAGE: "list"
    │   └── Component: <FacilitiesList />
    │       └── Props: { facilities, loading, error, search*, filter*, onSearch, onFilter, onViewDetails, onEdit, onDelete, onCreateNew }
    │
    ├── PAGE: "form"
    │   └── Component: <FacilityForm />
    │       ├── Mode: Create (editingFacility = null)
    │       └── Mode: Edit (editingFacility = {facility})
    │       └── Props: { facility, onSubmit, onCancel }
    │
    └── PAGE: "details"
        └── Component: <FacilityDetails />
            └── Props: { facility, onEdit, onDelete, onBack }
```

---

## 🧭 State-Based Page Navigation

### Navigation Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     SMART CAMPUS FACILITIES                 │
│                   Facilities Management System               │
└─────────────────────────────────────────────────────────────┘

START (Load App)
  │
  ├─→ Check localStorage for saved state
  │   ├─→ If exists: Restore (page, search, filters)
  │   └─→ If not: Default to Dashboard
  │
  └─→ DASHBOARD PAGE
      │
      ├── Display Statistics
      ├── Quick Action Cards
      │
      └── Navigation Options:
          │
          ├─→ [FACILITIES BUTTON] → LIST PAGE
          │
          ├─→ [NEW FACILITY BUTTON] → FORM PAGE (Create Mode)
          │
          └─→ [STAT CARDS] → LIST PAGE (Filtered)


LIST PAGE (Facilities List View)
  │
  ├── Features:
  │   ├── Search Bar
  │   │   └─→ onSearch → API Call → Update facilities
  │   │
  │   ├── Filter Panel
  │   │   ├── By Type (LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT)
  │   │   └── By Status (ACTIVE, OUT_OF_SERVICE, MAINTENANCE)
  │   │       └─→ onFilter → API Call → Update facilities
  │   │
  │   └── Facility Cards
  │       └── Each Card has:
  │           ├── [VIEW] Button → DETAILS PAGE
  │           ├── [EDIT] Button → FORM PAGE (Edit Mode)
  │           ├── [DELETE] Button → Delete Handler
  │           └── [+] New Button → FORM PAGE (Create Mode)
  │
  └── Navigation:
      ├─→ Dashboard (Navigation Bar)
      └─→ New Facility (+ Button)


FORM PAGE (Create/Edit Facility)
  │
  ├── Mode Detection:
  │   ├── CREATE: editingFacility = null
  │   │   └─→ POST to /facilities
  │   │
  │   └── EDIT: editingFacility = {facility object}
  │       └─→ PUT to /facilities/{id}
  │
  ├── Form Fields:
  │   ├── Name
  │   ├── Type (Dropdown)
  │   ├── Capacity
  │   ├── Location
  │   ├── Description
  │   ├── Status
  │   ├── Amenities
  │   ├── Floor/Building
  │   ├── Contact Info
  │   ├── Cost Per Hour
  │   ├── Requires Approval
  │   ├── Coordinates
  │   └── Image URL
  │
  ├── Validation:
  │   ├── Required fields check
  │   ├── Email format validation
  │   ├── Phone format validation
  │   └── Error display
  │
  └── Actions:
      ├─→ [SUBMIT] → Create/Update → Back to LIST PAGE
      └─→ [CANCEL] → Discard Changes → Back to LIST PAGE


DETAILS PAGE (Facility Details View)
  │
  ├── Display:
  │   ├── Header with facility name
  │   ├── Status badge
  │   ├── Image (if available)
  │   ├── Basic Info
  │   │   ├── Type, Capacity
  │   │   ├── Location, Floor
  │   │   └── Building Code
  │   │
  │   ├── Amenities List
  │   │
  │   ├── Contact Information
  │   │   ├── Person Name
  │   │   ├── Email
  │   │   └── Phone
  │   │
  │   ├── Availability Windows
  │   │
  │   ├── Cost Information
  │   │   ├── Cost Per Hour
  │   │   └── Approval Required
  │   │
  │   └── Metadata
  │       ├── Created By, Created At
  │       ├── Updated By, Updated At
  │       ├── Total Bookings
  │       └── Average Rating
  │
  └── Actions:
      ├─→ [EDIT] Button → FORM PAGE (Edit Mode, set editingFacility)
      ├─→ [DELETE] Button → Delete Handler
      │   └─→ Confirm Dialog → Delete → Back to LIST PAGE
      └─→ [BACK] Button → LIST PAGE
```

---

## 🔄 Complete State Transitions

### State Update Patterns

#### 1. Page Navigation
```javascript
// User clicks navigation button
onNavigate('list') → setCurrentPage('list')

// Component rerenders based on currentPage value
{currentPage === 'list' ? <FacilitiesList /> : null}
```

#### 2. Create New Facility
```
User Flow:
  Click "New Facility" 
  → setCurrentPage('form'), setEditingFacility(null)
  → <FacilityForm facility={null} onSubmit={handleCreateFacility} />
  → User fills form and clicks Submit
  → onSubmit(facilityData)
  → handleCreateFacility(facilityData)
  → API Call: POST /facilities
  → Update state: setFacilities([...facilities, newFacility])
  → Navigate: setCurrentPage('list')
  → Reload list with new facility visible
```

#### 3. Edit Existing Facility
```
User Flow:
  Click "Edit" on facility card
  → setEditingFacility(facility)
  → setCurrentPage('form')
  → <FacilityForm facility={editingFacility} onSubmit={handleUpdateFacility} />
  → User modifies form and clicks Submit
  → onSubmit(id, facilityData)
  → handleUpdateFacility(id, facilityData)
  → API Call: PUT /facilities/{id}
  → Update state: facilities[index] = updatedFacility
  → Navigate: setCurrentPage('list')
  → Reload list with updated facility
```

#### 4. Delete Facility
```
User Flow:
  Click "Delete" button
  → Confirmation dialog: "Are you sure?"
  → User confirms
  → handleDeleteFacility(id)
  → API Call: DELETE /facilities/{id}
  → Update state: filter out deleted facility
  → If facility was selected: clear selection & navigate to list
```

#### 5. Search Facilities
```
User Flow:
  Type in search box
  → onSearch(query)
  → handleSearch(query)
  ├─ If query.trim():
  │   → API Call: GET /facilities/search/by-name?name={query}
  │   → Update state: setFacilities(searchResults)
  └─ If query empty:
      → API Call: GET /facilities with filters
      → Update state: setFacilities(filteredResults)
  → Display results
```

#### 6. Filter Facilities
```
User Flow:
  Select filter (Type / Status)
  → onFilter(type, status)
  → handleFilter(type, status)
  → setFilterType(type), setFilterStatus(status)
  → API Call: GET /facilities?type={type}&status={status}
  → Update state: setFacilities(filteredResults)
  → Display filtered results
```

---

## 📍 Route Parameters in State

### currentPage Values & Corresponding Components

| Value | Component | Use Case | Parent Props | Child Props |
|-------|-----------|----------|-------------|------------|
| `'dashboard'` | Dashboard | Statistics & overview | facilities | facilities, onNavigate |
| `'list'` | FacilitiesList | Browse & manage | facilities, loading, error, search, filter | All list handlers |
| `'form'` | FacilityForm | Create/Edit | editingFacility | facility, onSubmit, onCancel |
| `'details'` | FacilityDetails | View details | selectedFacility | facility, onEdit, onDelete, onBack |

---

## 🔗 API Route Integration

### How Routes Map to API Endpoints

```javascript
// Dashboard Page
case 'dashboard':
  useEffect(() => {
    facilitiesAPI.getStatistics()  // GET /facilities/statistics
  })

// List Page - Get All
case 'list':
  useEffect(() => {
    fetchFacilities()  // GET /facilities (with optional filters)
  })

// List Page - Search
handleSearch(query) {
  facilitiesAPI.searchByName(query)  // GET /facilities/search/by-name?name={query}
}

// List Page - Filter
handleFilter(type, status) {
  fetchFacilities({ type, status })  // GET /facilities?type={type}&status={status}
}

// Form Page - Create
handleCreateFacility(data) {
  facilitiesAPI.createFacility(data)  // POST /facilities
}

// Form Page - Update
handleUpdateFacility(id, data) {
  facilitiesAPI.updateFacility(id, data)  // PUT /facilities/{id}
}

// Details/List Page - Delete
handleDeleteFacility(id) {
  facilitiesAPI.deleteFacility(id)  // DELETE /facilities/{id}
}

// Details Page - View
handleViewDetails(facility) {
  setSelectedFacility(facility)  // Uses already-loaded data
  setCurrentPage('details')
}
```

---

## 💾 Persistence Points

### When State is Saved to LocalStorage

```javascript
// Triggered on any of these changes:
useEffect(() => {
  localStorage.setItem('smart-campus-facilities-ui-state', JSON.stringify({
    currentPage,      // Save current page
    searchQuery,      // Save search
    filterType,       // Save filters
    filterStatus,
    selectedFacilityId
  }))
}, [currentPage, searchQuery, filterType, filterStatus, selectedFacilityId])

// Restored on app load:
const [currentPage] = useState(() => {
  const saved = localStorage.getItem('smart-campus-facilities-ui-state')
  return saved ? JSON.parse(saved).currentPage : 'dashboard'
})
```

---

## 🎯 User Journey Examples

### Journey 1: Create New Facility
```
START
→ Dashboard (loaded)
→ Click "New Facility"
→ Form Page (empty form)
→ Fill all fields
→ Click "Submit"
→ API: Create facility
→ List Page (see new facility)
→ Optional: Click facility → Details Page
END
```

### Journey 2: Edit Existing Facility
```
START
→ Dashboard
→ Click "Facilities"
→ List Page (see all facilities)
→ Click "Edit" on a facility
→ Form Page (form populated)
→ Modify fields
→ Click "Submit"
→ API: Update facility
→ List Page (see updated facility)
END
```

### Journey 3: Search & Filter
```
START
→ List Page
→ Type "lab" in search
→ Click "Search"
→ API: Search by name
→ List updates with "lab" results
→ Click "Filter" dropdown
→ Select "ACTIVE" status
→ API: Filter by status
→ List shows ACTIVE labs
→ Clear search → API: Get filtered only
→ Clear filters → API: Get all
END
```

### Journey 4: Delete Facility
```
START
→ List Page
→ Click "Delete" button
→ Confirmation dialog
→ Click "Confirm"
→ API: Delete facility
→ Facility removed from list
→ Show success message
END
```

---

## ✅ Route Verification

- [x] Dashboard routes to itself
- [x] Dashboard navigates to List
- [x] List navigates to Form (create)
- [x] List navigates to Details
- [x] Details navigates to Form (edit)
- [x] Details navigates back to List
- [x] Form navigates to List on submit
- [x] Form navigates to List on cancel
- [x] All state persists to localStorage
- [x] All navigation uses state (not URL params)
- [x] All API calls properly integrated
- [x] All error states handled

---

**Status**: ✅ Complete & Verified
**Ready for**: Testing and Deployment
