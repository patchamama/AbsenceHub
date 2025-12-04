# PROJECT_SPECS.md - AbsenceHub Requirements & User Stories

## Project Overview

**AbsenceHub** is an Employee Absence Management System designed to track and manage employee absences with support for multiple absence types, data validation, and Power BI integration readiness.

---

## Business Requirements

### BR-1: Absence Management
The system must provide complete CRUD (Create, Read, Update, Delete) operations for employee absences.

### BR-2: Data Validation
The system must enforce business rules to prevent invalid data entry and overlapping absences.

### BR-3: Multi-language Support
The system must support both English and German languages for all user-facing content.

### BR-4: Power BI Integration
The system must structure data in a way that facilitates easy integration with Power BI dashboards.

### BR-5: Audit Trail
The system must track when records are created and modified for audit purposes.

---

## Functional Requirements

### FR-1: Employee Identification
**Priority**: High  
**Description**: System must uniquely identify employees using service account format.

**Acceptance Criteria**:
- Service account follows format: `s.firstname.lastname`
- Service account is mandatory
- Service account cannot be changed after creation
- System validates format on input

### FR-2: Absence Types
**Priority**: High  
**Description**: System must support four predefined absence types.

**Types**:
1. **Urlaub** (Vacation) - Planned time off
2. **Krankheit** (Sick Leave) - Medical-related absences
3. **Home Office** - Remote work days
4. **Sonstige** (Other) - Miscellaneous absences

**Acceptance Criteria**:
- Only predefined types are accepted
- Type cannot be null
- Type can be changed during edit
- System provides translations for all types

### FR-3: Date Management
**Priority**: High  
**Description**: System must manage absence date ranges with validation.

**Acceptance Criteria**:
- Start date is mandatory
- End date is mandatory
- End date must be >= start date
- Dates are stored in ISO 8601 format (YYYY-MM-DD)
- System validates date logic before saving

### FR-4: Overlap Prevention
**Priority**: High  
**Description**: System must prevent overlapping absences of the same type for the same employee.

**Rules**:
- An employee cannot have overlapping periods for the same absence type
- Different absence types can overlap (e.g., Home Office can overlap with Vacation)
- Different employees can have overlapping absences
- During update, the record being updated is excluded from overlap check

**Acceptance Criteria**:
- System checks for overlaps before creating new absence
- System checks for overlaps before updating absence
- Clear error message indicates which absence is conflicting
- Validation occurs on both client and server side

### FR-5: Optional Employee Name
**Priority**: Medium  
**Description**: System should allow storing full employee name for readability.

**Acceptance Criteria**:
- Employee name is optional
- Maximum length: 200 characters
- Name can be updated at any time
- System displays name if available, otherwise shows service account

### FR-6: Absence Filtering
**Priority**: Medium  
**Description**: Users must be able to filter absences by multiple criteria.

**Filter Options**:
- By service account (exact match or partial)
- By absence type
- By date range (start date, end date, or both)
- Multiple filters can be applied simultaneously

**Acceptance Criteria**:
- Filters return accurate results
- Empty filters return all records
- Filter results update without page reload
- Clear filter button resets all filters

### FR-7: Absence Statistics
**Priority**: Low  
**Description**: System should provide basic statistics about absences.

**Statistics Include**:
- Total number of absences
- Count by absence type
- Number of unique employees with absences

**Acceptance Criteria**:
- Statistics are calculated in real-time
- Statistics are accessible via dedicated endpoint
- Results are accurate and performant

---

## User Stories

### Epic 1: Absence Creation

#### US-1.1: Create New Absence
**As a** manager  
**I want to** create a new absence record  
**So that** I can track when employees are not available

**Acceptance Criteria**:
- Given I'm on the absence management page
- When I click "Add Absence" button
- Then a form appears with all required fields
- And I can select absence type from dropdown
- And I can pick dates using date picker
- And I can optionally enter employee name
- And form shows validation errors if data is invalid
- And successful creation shows confirmation message
- And new absence appears in the list

**Definition of Done**:
- [ ] Form component created with all fields
- [ ] Client-side validation implemented
- [ ] API endpoint created and tested
- [ ] Server-side validation implemented
- [ ] Success/error messages displayed
- [ ] Unit tests pass
- [ ] Integration tests pass

#### US-1.2: Prevent Invalid Absence Creation
**As a** manager  
**I want to** receive clear error messages for invalid data  
**So that** I can correct mistakes before submitting

**Acceptance Criteria**:
- Given I'm creating an absence
- When I enter an invalid service account format
- Then system shows "Service account must start with 's.'"
- When I select end date before start date
- Then system shows "End date cannot be before start date"
- When I try to create overlapping absence
- Then system shows "This absence overlaps with existing [type] absence"
- And error messages appear next to relevant fields
- And form cannot be submitted until errors are fixed

**Definition of Done**:
- [ ] All validation rules implemented
- [ ] Error messages are clear and helpful
- [ ] Errors appear in real-time
- [ ] Tests cover all validation scenarios

### Epic 2: Absence Viewing

#### US-2.1: View All Absences
**As a** manager  
**I want to** see a list of all absences  
**So that** I can get an overview of team availability

**Acceptance Criteria**:
- Given I'm on the absence management page
- When the page loads
- Then I see a table with all absences
- And table shows: service account, name, type, start date, end date
- And absences are sorted by start date (newest first)
- And table is responsive on mobile devices

**Definition of Done**:
- [ ] List component created
- [ ] Data fetched from API
- [ ] Table displays all fields correctly
- [ ] Sorting implemented
- [ ] Responsive design tested
- [ ] Loading state shown while fetching

#### US-2.2: Filter Absences
**As a** manager  
**I want to** filter absences by employee or type  
**So that** I can quickly find specific information

**Acceptance Criteria**:
- Given I'm viewing the absence list
- When I enter a service account in the filter
- Then only absences for that employee are shown
- When I select an absence type
- Then only absences of that type are shown
- When I select date range
- Then only absences within that range are shown
- And I can combine multiple filters
- And clear button resets all filters

**Definition of Done**:
- [ ] Filter UI component created
- [ ] Filter logic implemented
- [ ] API supports filter parameters
- [ ] Multiple filters work together
- [ ] Clear filters functionality works
- [ ] Tests cover filter combinations

### Epic 3: Absence Modification

#### US-3.1: Edit Existing Absence
**As a** manager  
**I want to** modify an absence record  
**So that** I can correct errors or update information

**Acceptance Criteria**:
- Given I'm viewing an absence in the list
- When I click "Edit" button
- Then form opens with current values pre-filled
- And service account field is disabled (cannot change)
- And I can modify absence type, dates, and name
- And validation rules still apply
- And successful update shows confirmation
- And list refreshes with updated data

**Definition of Done**:
- [ ] Edit mode in form component
- [ ] Pre-population of form fields
- [ ] Service account field disabled
- [ ] PUT endpoint created and tested
- [ ] Validation during update
- [ ] Success feedback shown
- [ ] Tests for edit functionality

#### US-3.2: Delete Absence
**As a** manager  
**I want to** delete an absence record  
**So that** I can remove entries made in error

**Acceptance Criteria**:
- Given I'm viewing an absence in the list
- When I click "Delete" button
- Then confirmation dialog appears
- And dialog shows employee and date details
- When I confirm deletion
- Then absence is removed from database
- And list updates without page reload
- And confirmation message is shown

**Definition of Done**:
- [ ] Delete button in list
- [ ] Confirmation dialog implemented
- [ ] DELETE endpoint created and tested
- [ ] Optimistic UI update or refresh
- [ ] Success message shown
- [ ] Tests for delete functionality

### Epic 4: Internationalization

#### US-4.1: Switch Language
**As a** user  
**I want to** switch between English and German  
**So that** I can use the system in my preferred language

**Acceptance Criteria**:
- Given I'm on any page
- When I select German from language dropdown
- Then all UI text changes to German
- And absence types show German names
- And my preference is saved
- When I reload the page
- Then my language preference is remembered

**Definition of Done**:
- [ ] Language selector component
- [ ] Translation files for both languages
- [ ] All text externalized
- [ ] Absence type translations
- [ ] Preference saved to localStorage
- [ ] Tests for language switching

### Epic 5: Data Quality

#### US-5.1: Validate Service Account Format
**As a** system administrator  
**I want to** enforce service account format  
**So that** data remains consistent

**Acceptance Criteria**:
- Given a user enters service account
- When format is incorrect (e.g., "john.doe")
- Then error shown: "Must start with 's.'"
- When format is correct (e.g., "s.john.doe")
- Then validation passes
- And validation occurs on both frontend and backend

**Definition of Done**:
- [ ] Regex validation pattern
- [ ] Client-side validation
- [ ] Server-side validation
- [ ] Clear error messages
- [ ] Tests for various formats

#### US-5.2: Prevent Date Logic Errors
**As a** system administrator  
**I want to** prevent invalid date ranges  
**So that** data integrity is maintained

**Acceptance Criteria**:
- Given a user selects dates
- When end date is before start date
- Then error shown and save prevented
- When dates are equal
- Then validation passes (same-day absence allowed)
- And validation occurs before database save

**Definition of Done**:
- [ ] Date comparison logic
- [ ] Client validation
- [ ] Server validation
- [ ] Error messages
- [ ] Edge case tests

---

## Non-Functional Requirements

### NFR-1: Performance
**Requirement**: System must respond quickly to user actions.

**Metrics**:
- API response time < 200ms for GET requests
- API response time < 500ms for POST/PUT/DELETE
- Frontend initial load < 2 seconds
- Filter results update < 100ms

### NFR-2: Scalability
**Requirement**: System must handle growing data volumes.

**Metrics**:
- Support 10,000+ absence records
- Support 1,000+ employees
- Database queries optimized with indexes
- API supports pagination (future enhancement)

### NFR-3: Reliability
**Requirement**: System must be stable and available.

**Metrics**:
- 99.9% uptime during business hours
- Automatic error recovery
- Database transactions for data consistency
- Comprehensive error logging

### NFR-4: Security
**Requirement**: System must protect data integrity.

**Security Measures**:
- SQL injection prevention via ORM
- Input validation on all fields
- CORS configuration
- Environment variables for secrets
- No sensitive data in logs

### NFR-5: Usability
**Requirement**: System must be easy to use.

**Criteria**:
- Intuitive navigation
- Clear error messages
- Responsive design (desktop, tablet, mobile)
- Consistent UI patterns
- Minimal clicks to complete tasks

### NFR-6: Maintainability
**Requirement**: Code must be easy to understand and modify.

**Criteria**:
- Clean code principles
- Comprehensive comments
- Consistent naming conventions
- Modular architecture
- Test coverage > 80%

### NFR-7: Testability
**Requirement**: All functionality must be testable.

**Criteria**:
- Unit tests for all business logic
- Integration tests for API endpoints
- Component tests for UI
- End-to-end tests for critical flows
- Automated test execution

---

## Data Model

### Entity: EmployeeAbsence

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| service_account | VARCHAR(100) | NOT NULL, INDEX | Employee service account |
| employee_fullname | VARCHAR(200) | NULL | Optional full name |
| absence_type | VARCHAR(50) | NOT NULL, INDEX | Type of absence |
| start_date | DATE | NOT NULL, INDEX | Start of absence |
| end_date | DATE | NOT NULL, INDEX | End of absence |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW(), ON UPDATE NOW() | Last update timestamp |

**Constraints**:
- `end_date >= start_date`
- `absence_type IN ('Urlaub', 'Krankheit', 'Home Office', 'Sonstige')`
- No overlapping absences for same employee + type

**Indexes**:
- Primary key on `id`
- Index on `service_account` (filtering)
- Index on `absence_type` (filtering)
- Index on `start_date` (sorting/filtering)
- Index on `end_date` (filtering)
- Composite index on `(service_account, absence_type, start_date)` (overlap check)

---

## API Specification

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. List Absences
```
GET /absences
Query Parameters:
  - service_account (optional)
  - absence_type (optional)
  - start_date (optional, YYYY-MM-DD)
  - end_date (optional, YYYY-MM-DD)
Response: 200 OK, array of absences
```

#### 2. Get Single Absence
```
GET /absences/:id
Response: 200 OK, absence object
Response: 404 Not Found
```

#### 3. Create Absence
```
POST /absences
Body: {
  service_account: string (required),
  employee_fullname: string (optional),
  absence_type: string (required),
  start_date: string (required, YYYY-MM-DD),
  end_date: string (required, YYYY-MM-DD)
}
Response: 201 Created, created absence
Response: 400 Bad Request, validation errors
```

#### 4. Update Absence
```
PUT /absences/:id
Body: {
  absence_type: string (optional),
  employee_fullname: string (optional),
  start_date: string (optional),
  end_date: string (optional)
}
Response: 200 OK, updated absence
Response: 400 Bad Request, validation errors
Response: 404 Not Found
```

#### 5. Delete Absence
```
DELETE /absences/:id
Response: 200 OK, deleted absence
Response: 404 Not Found
```

#### 6. Get Absence Types
```
GET /absence-types
Response: 200 OK, list of valid types with translations
```

#### 7. Get Statistics
```
GET /statistics
Response: 200 OK, statistics object
```

---

## Success Criteria Summary

### For v1.0 Release, the system must:

✅ Allow creating absences with all required fields  
✅ Validate service account format (s.firstname.lastname)  
✅ Validate date ranges (end >= start)  
✅ Prevent overlapping absences of same type  
✅ Allow editing absences (except service account)  
✅ Allow deleting absences with confirmation  
✅ Display all absences in sortable table  
✅ Filter absences by employee, type, and dates  
✅ Support English and German languages  
✅ Remember language preference  
✅ Show clear error messages  
✅ Provide statistics endpoint  
✅ Have test coverage > 80% (backend)  
✅ Have test coverage > 70% (frontend)  
✅ Work on desktop, tablet, and mobile  
✅ Load in under 2 seconds  
✅ Respond to API calls in under 500ms  

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Status**: ✅ Fully Implemented