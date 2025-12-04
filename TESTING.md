# AbsenceHub Testing & Requirements Verification Guide

Comprehensive guide to test that AbsenceHub meets all functional and non-functional requirements.

## Table of Contents

1. [Installation Verification](#installation-verification)
2. [Functional Requirements Testing](#functional-requirements-testing)
3. [Backend API Testing](#backend-api-testing)
4. [Frontend Feature Testing](#frontend-feature-testing)
5. [Database Testing](#database-testing)
6. [Performance Testing](#performance-testing)
7. [Cross-Platform Testing](#cross-platform-testing)

## Installation Verification

### Automated Installation Check

```bash
# Run the installer
python3 install.py

# Expected results:
# ✓ System requirements checked
# ✓ Dependencies installed
# ✓ Database configured and running
# ✓ Sample data inserted
# ✓ Configuration saved
```

**Verification Points:**
- [ ] Python 3.9+ detected
- [ ] Node.js and npm found
- [ ] Git installed
- [ ] Docker found (if Docker option chosen)
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Database connection successful
- [ ] Migrations completed
- [ ] Sample data inserted (24 records)
- [ ] `.env.installer` created with configuration

### System Verification

```bash
# Run complete verification
python3 verify.py --full

# Check results in verification_report.json
```

**Expected Output:**
```
✓ System Information: Detected OS and architecture
✓ Python 3.9+: Found correct version
✓ Node.js: Found version
✓ npm: Found version
✓ Git: Found version
✓ Backend directory: Exists
✓ requirements.txt: Exists
✓ Frontend directory: Exists
✓ package.json: Exists
✓ node_modules: Installed
✓ Database connection: Connected
✓ Port 5000: Available
✓ Port 5173: Available
✓ Frontend build: Success
```

## Functional Requirements Testing

### FR-1: Employee Identification

**Test: Service Account Format Validation**

1. Create new absence
2. Try invalid formats:
   - [ ] "john.doe" (no s. prefix) → Error: "must start with 's.'"
   - [ ] "s.john" (missing lastname) → Error: "must follow format: s.firstname.lastname"
   - [ ] "s.john.doe.extra" (too many parts) → Should accept
3. Try valid format:
   - [ ] "s.john.doe" → Accepted

**Expected Behavior:**
- Format validation occurs on blur (frontend)
- Validation occurs on submit (frontend)
- Server validates before saving
- Error messages are clear and helpful

### FR-2: Absence Types

**Test: Absence Type Selection**

1. Open form to create absence
2. Click absence type dropdown
3. Verify available options:
   - [ ] Urlaub (Vacation)
   - [ ] Krankheit (Sick Leave)
   - [ ] Home Office
   - [ ] Sonstige (Other)
4. Select each type and confirm
5. Check backend API: `GET /api/absence-types`

**Expected Behavior:**
- All 4 types available in dropdown
- Each type translatable (EN/DE)
- Cannot be null
- Stored correctly in database

### FR-3: Date Management

**Test: Date Range Validation**

1. Create absence with dates:
   - [ ] Start: 2025-12-15, End: 2025-12-20 → Success
   - [ ] Start: 2025-12-20, End: 2025-12-15 → Error: "End date cannot be before start date"
   - [ ] Start: 2025-12-20, End: 2025-12-20 (same day) → Success
   - [ ] Missing start date → Error: "Start date is required"
   - [ ] Missing end date → Error: "End date is required"

**Expected Behavior:**
- Both dates required
- End date >= Start date
- Same-day absences allowed
- Client-side and server-side validation
- Error messages displayed clearly

### FR-4: Overlap Prevention

**Test: Overlapping Absences of Same Type**

1. Create first absence: s.john.doe, Urlaub, 2025-12-15 to 2025-12-20
2. Try to create overlapping:
   - [ ] Same employee, same type, overlapping dates → Error
   - [ ] Same employee, different type, overlapping dates → Success
   - [ ] Different employee, same type, overlapping dates → Success
   - [ ] Different dates (no overlap) → Success

**Expected Behavior:**
- Prevents overlapping of same type for same employee
- Allows different types to overlap
- Different employees can have overlapping absences
- Clear error message indicating conflict

### FR-5: Optional Employee Name

**Test: Employee Name Field**

1. Create absence:
   - [ ] With name: "John Doe" → Accepts and displays
   - [ ] Without name (empty) → Accepts, displays service account instead
   - [ ] Max 200 chars → Accepts
   - [ ] > 200 chars → Error: "must be less than 200 characters"

**Expected Behavior:**
- Name is optional
- 200 character limit enforced
- Validates on blur and submit
- Displays name in list if provided

### FR-6: Absence Filtering

**Test: Filtering Functionality**

1. **Filter by Service Account:**
   - [ ] Enter "s.john" → Shows only John's absences
   - [ ] Enter "invalid.account" → Shows no results
   - [ ] Clear filter → Shows all absences

2. **Filter by Absence Type:**
   - [ ] Select "Urlaub" → Shows only vacation
   - [ ] Select "Krankheit" → Shows only sick leave
   - [ ] Clear filter → Shows all

3. **Filter by Date Range:**
   - [ ] From: 2025-12-01, To: 2025-12-15 → Shows matching dates
   - [ ] From: 2025-12-20, To: 2025-12-01 → Error or reset
   - [ ] Clear filters → Shows all

4. **Multiple Filters:**
   - [ ] Service account + Type → Shows intersection
   - [ ] Service account + Type + Date range → Shows intersection
   - [ ] Clear All button → Resets all filters

**Expected Behavior:**
- Filters work individually and combined
- Real-time filtering (debounced)
- Clear results messages
- Filter values persist until cleared

### FR-7: Absence Statistics

**Test: Statistics Display**

1. Open application main page
2. Verify statistics section shows:
   - [ ] Total Absences: Correct count (should be 24 from seed data)
   - [ ] Unique Employees: Correct count (should be 8)
   - [ ] Absences by Type:
     - [ ] Urlaub: Count displayed
     - [ ] Krankheit: Count displayed
     - [ ] Home Office: Count displayed
     - [ ] Sonstige: Count displayed

3. API Test:
   ```bash
   curl http://localhost:5000/api/statistics
   ```
   - [ ] Returns JSON with total_absences
   - [ ] Returns unique_employees count
   - [ ] Returns by_type breakdown

**Expected Behavior:**
- Statistics accurate and real-time
- Updates after create/edit/delete
- Accessible via API endpoint
- Proper calculations

## Backend API Testing

### API Endpoint Tests

**1. GET /api/absences**
```bash
curl http://localhost:5000/api/absences
```
- [ ] Returns 200 status
- [ ] Returns array of absence objects
- [ ] Each object has: id, service_account, absence_type, start_date, end_date, created_at, updated_at
- [ ] Total count matches (24 from seed data)

**2. GET /api/absences?service_account=s.john.doe**
```bash
curl http://localhost:5000/api/absences?service_account=s.john.doe
```
- [ ] Returns 200 status
- [ ] Only returns absences for specified account
- [ ] Filter parameter works

**3. GET /api/absences/:id**
```bash
curl http://localhost:5000/api/absences/1
```
- [ ] Returns 200 status
- [ ] Returns single absence object
- [ ] Returns 404 for non-existent ID

**4. POST /api/absences**
```bash
curl -X POST http://localhost:5000/api/absences \
  -H "Content-Type: application/json" \
  -d '{
    "service_account": "s.test.user",
    "employee_fullname": "Test User",
    "absence_type": "Urlaub",
    "start_date": "2025-12-25",
    "end_date": "2025-12-30"
  }'
```
- [ ] Returns 201 Created
- [ ] Returns created absence object with ID
- [ ] Record appears in GET /api/absences
- [ ] Validates all fields
- [ ] Returns 400 for invalid data

**5. PUT /api/absences/:id**
```bash
curl -X PUT http://localhost:5000/api/absences/1 \
  -H "Content-Type: application/json" \
  -d '{
    "employee_fullname": "Updated Name",
    "absence_type": "Krankheit"
  }'
```
- [ ] Returns 200 OK
- [ ] Returns updated object
- [ ] Changes are persisted
- [ ] Service account cannot be changed

**6. DELETE /api/absences/:id**
```bash
curl -X DELETE http://localhost:5000/api/absences/1
```
- [ ] Returns 200 OK
- [ ] Record no longer appears in GET request
- [ ] Returns 404 for subsequent delete

**7. GET /api/absence-types**
```bash
curl http://localhost:5000/api/absence-types
```
- [ ] Returns 200 status
- [ ] Returns array of 4 types
- [ ] Each type has value and label

**8. GET /api/statistics**
```bash
curl http://localhost:5000/api/statistics
```
- [ ] Returns 200 status
- [ ] Includes total_absences, unique_employees, by_type

### Response Time Tests

Test API performance:
```bash
# Single request time
time curl http://localhost:5000/api/absences

# Expected: < 500ms total time
```

- [ ] GET /api/absences: < 200ms
- [ ] POST /api/absences: < 500ms
- [ ] PUT /api/absences/:id: < 500ms
- [ ] DELETE /api/absences/:id: < 500ms

## Frontend Feature Testing

### 1. Create Absence

```
Steps:
1. Click "Add Absence" button
2. Fill form:
   - Service Account: s.john.doe
   - Name: John Doe
   - Type: Urlaub
   - Start: 2025-12-20
   - End: 2025-12-25
3. Click Submit
```

- [ ] Modal opens
- [ ] Form fields are empty
- [ ] Service account field accepts input
- [ ] Date picker works
- [ ] Submit button is active
- [ ] Success message appears: "created successfully"
- [ ] Modal closes
- [ ] New record appears in table
- [ ] Statistics update

### 2. Edit Absence

```
Steps:
1. Click Edit on any absence
2. Modify employee name
3. Change absence type
4. Click Submit
```

- [ ] Modal opens with filled data
- [ ] Service account field is disabled
- [ ] Other fields are editable
- [ ] Changes saved successfully
- [ ] Success message appears: "updated successfully"
- [ ] Table updates with new values

### 3. Delete Absence

```
Steps:
1. Click Delete on any absence
2. Confirm deletion
3. Verify removal
```

- [ ] Confirmation dialog appears
- [ ] Dialog shows absence details
- [ ] Confirm button deletes absence
- [ ] Success message appears: "deleted successfully"
- [ ] Record removed from table
- [ ] Statistics update

### 4. Language Switching

```
Steps:
1. Click language selector (top right)
2. Switch to German
3. Verify all text changed
4. Refresh page
5. Verify German still selected
```

- [ ] EN/DE options visible
- [ ] All labels change to German:
  - [ ] "Abwesenheit hinzufügen" (Add Absence)
  - [ ] "Abwesenheitsverwaltung" (Absence Management)
  - [ ] Absence types in German
- [ ] Frontend in German: http://localhost:5173
- [ ] Preference persists on reload
- [ ] API calls work in either language

### 5. Form Validation

```
Steps:
1. Click "Add Absence"
2. Click Submit without filling fields
3. Verify error messages
```

- [ ] "Service account is required"
- [ ] "Absence type is required"
- [ ] "Start date is required"
- [ ] "End date is required"
- [ ] Form won't submit
- [ ] Error messages in red
- [ ] Errors clear when typing

### 6. Keyboard Navigation

```
Steps:
1. Open absence form (modal)
2. Press Tab through all fields
3. Press Escape to close modal
4. Verify focus trap works
```

- [ ] Tab navigates through all form fields
- [ ] Tab loops back to first field
- [ ] Shift+Tab navigates backwards
- [ ] Escape closes modal
- [ ] Focus returns to trigger button
- [ ] Enter on button activates it

### 7. Responsive Design

Test on different screen sizes:

```
Desktop (1920x1080):
- [ ] Layout looks good
- [ ] Buttons properly sized
- [ ] Table scrolls if needed

Tablet (768x1024):
- [ ] Layout adapts
- [ ] Buttons are touch-friendly
- [ ] Form is usable

Mobile (375x667):
- [ ] Layout stacks vertically
- [ ] Modal fits on screen
- [ ] Buttons are touch-friendly
- [ ] Table scrolls horizontally
```

## Database Testing

### Docker Database Tests

**Verify Container Running:**
```bash
docker ps | grep absencehub-postgres
```
- [ ] Container listed as running
- [ ] Port 5432 mapped
- [ ] Up for expected time

**Database Connection:**
```bash
psql -U postgres -h localhost -d absencehub
```
- [ ] Connects successfully
- [ ] \dt lists employee_absences table
- [ ] SELECT COUNT(*) returns 24 (seed data)

**Data Persistence:**
```bash
# Create absence
curl -X POST http://localhost:5000/api/absences \
  -H "Content-Type: application/json" \
  -d '{"service_account":"s.test","absence_type":"Urlaub","start_date":"2025-12-30","end_date":"2025-12-31"}'

# Restart container
docker restart absencehub-postgres

# Verify data still exists
curl http://localhost:5000/api/absences | grep "s.test"
```
- [ ] Data persists after container restart
- [ ] No data loss

### External Database Tests

**Connection Test:**
```bash
psql -U username -h hostname -p 5432 -d absencehub
```
- [ ] Connects to specified server
- [ ] Can read absences table
- [ ] Can write new records

**Credentials Test:**
```bash
# Verify config
cat .env.installer
```
- [ ] Host correct
- [ ] Port correct
- [ ] Username/password correct
- [ ] Database name correct

## Performance Testing

### Load Test

```bash
# Simple load test (100 requests)
ab -n 100 -c 10 http://localhost:5000/api/absences
```

**Expected Results:**
- [ ] Response time: < 200ms average
- [ ] Failed requests: 0
- [ ] Requests/sec: > 5

### Frontend Performance

**Lighthouse Audit:**
1. Open DevTools (F12)
2. Click Lighthouse tab
3. Run audit

**Targets:**
- [ ] Performance: > 80
- [ ] Accessibility: > 90
- [ ] Best Practices: > 80
- [ ] SEO: > 90

### Load Time Tests

```bash
# Measure initial page load
time curl http://localhost:5173
```

- [ ] Initial HTML: < 1 second
- [ ] Full page with assets: < 2 seconds
- [ ] Interactive ready: < 3 seconds

## Cross-Platform Testing

### Linux

**Distribution:** Ubuntu 20.04+

Test Checklist:
- [ ] Installer runs successfully
- [ ] All dependencies install
- [ ] Database setup works (Docker or PostgreSQL)
- [ ] Backend starts
- [ ] Frontend runs
- [ ] Application functional

### macOS

**Versions:** 10.15+, including M1/M2

Test Checklist:
- [ ] Installer runs successfully
- [ ] Homebrew packages install correctly
- [ ] Docker runs smoothly
- [ ] No architecture-specific issues
- [ ] All features work

### Windows

**Versions:** 10, 11

Test Checklist:
- [ ] install.bat launches correctly
- [ ] PowerShell/CMD execution works
- [ ] Docker Desktop integrates
- [ ] Backend starts in terminal
- [ ] Frontend dev server runs
- [ ] Application accessible

## Test Results Template

```
Date: _______________
Platform: _______________
Python Version: _______________
Node Version: _______________
Database Type: _______________

Installation: [ ] PASS [ ] FAIL
Backend API: [ ] PASS [ ] FAIL
Frontend: [ ] PASS [ ] FAIL
Database: [ ] PASS [ ] FAIL
Performance: [ ] PASS [ ] FAIL
Cross-Platform: [ ] PASS [ ] FAIL

Overall Result: [ ] PASS [ ] FAIL
Issues Found:
_________________________________
_________________________________

Tester: _______________
```

## Requirements Compliance Matrix

| Requirement | Test Case | Status |
|------------|-----------|--------|
| Employee Identification | FR-1 Service Account Format | [ ] ✓ |
| Absence Types | FR-2 Type Selection | [ ] ✓ |
| Date Management | FR-3 Date Validation | [ ] ✓ |
| Overlap Prevention | FR-4 Overlap Detection | [ ] ✓ |
| Optional Employee Name | FR-5 Name Handling | [ ] ✓ |
| Filtering | FR-6 Filter Functionality | [ ] ✓ |
| Statistics | FR-7 Statistics Display | [ ] ✓ |
| API Endpoints | Backend API Testing | [ ] ✓ |
| Performance | Performance Testing | [ ] ✓ |
| Cross-Platform | Cross-Platform Testing | [ ] ✓ |

---

**Testing Status:** Ready for comprehensive verification
**Test Coverage:** Functional, Backend, Frontend, Database, Performance
**Documentation:** Complete with all test cases
