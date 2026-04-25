# KETRAMS Role Migration Guide: SUB_COUNTY → TREASURY, ADMIN → MINISTRY_OFFICER

## Overview
This guide documents the complete role renaming migration across both frontend and backend systems.

## Frontend Changes ✅ COMPLETED

All frontend changes have been successfully completed. See detailed list below.

### 1. Core Type and Context Updates ✅
- **AuthContext.tsx**: Updated user role type definition and login routing
  - Role type: `'SUB_COUNTY' | 'ADMIN'` → `'TREASURY' | 'MINISTRY_OFFICER'`
  - Login routing updated for new role paths
  - `subCounty` field preserved for TREASURY users

- **types/index.ts**: Updated User interface role type union

- **proxy.ts**: Updated middleware route matching
  - `isProtectedRoute` checks updated from `/subcounty` and `/admin` to `/treasury` and `/ministry`
  - Config matcher updated

### 2. Component Updates ✅
- **DashboardSidebar.tsx**: 
  - Navigation keys: `subcounty` → `treasury`, `admin` → `ministry`
  - All hrefs updated: `/subcounty/...` → `/treasury/...`, `/admin/...` → `/ministry/...`
  - Fetch functions renamed: 
    - `fetchSubCountyData()` → `fetchTreasuryData()`
    - `fetchAdminData()` → `fetchMinistryData()`
  - API endpoints updated in fetch functions
  - Status filter updated: `PENDING_SUB_COUNTY` → `PENDING_TREASURY`

- **AuthGuard.tsx**:
  - Protected route checks updated
  - Dashboard mapping updated with new role names and paths

- **Layout Components**:
  - `src/app/(dashboard)/subcounty/layout.tsx`: Component renamed `SubCountyLayout` → `TreasuryLayout`
  - `src/app/(dashboard)/admin/layout.tsx`: Component renamed `AdminLayout` → `MinistryLayout`

### 3. API Endpoint Updates ✅
All API calls updated from `/subcounty/` to `/treasury/` and `/admin/` to `/ministry/`:

**Treasury Routes (formerly Subcounty):**
- `src/app/(dashboard)/subcounty/assets/page.tsx`: `/treasury/assets`
- `src/app/(dashboard)/subcounty/staff/page.tsx`: `/treasury/staff`
- `src/app/(dashboard)/subcounty/dashboard/page.tsx`: `/treasury/applications`
- `src/app/(dashboard)/subcounty/applications/page.tsx`: `/treasury/applications`, `/treasury/applications/batch/facilitate`, `/treasury/applications/export/csv`, `/treasury/students/{id}`
- `src/app/(dashboard)/subcounty/dashboard/applications/page.tsx`: `/treasury/applications`, `/treasury/applications/batch/facilitate`, `/treasury/applications/export/csv`
- `src/app/(dashboard)/subcounty/reports/page.tsx`: `/treasury/applications`, `/treasury/reports/summary`

**Ministry Routes (formerly Admin):**
- `src/app/(dashboard)/admin/institution-requests/page.tsx`: `/ministry/institution-requests`, `/ministry/institution-requests/process`
- `src/app/(dashboard)/admin/institution-users/page.tsx`: `/ministry/institution-users`, `/ministry/institutions`, `/ministry/institution-users/{id}/toggle-status`

### 4. Folder Renaming ⏳ MANUAL ACTION REQUIRED
Due to file system locking, the following folders need to be manually renamed:

```
src/app/(dashboard)/subcounty/ → src/app/(dashboard)/treasury/
src/app/(dashboard)/admin/ → src/app/(dashboard)/ministry/
```

**How to rename:**
1. Close VS Code or the entire workspace
2. Use File Explorer to rename the folders
3. Reopen the workspace

**Or using commands (if you have access to terminal with elevated privileges):**
```powershell
# Close VS Code first, then run:
cd C:\Users\Nashon\ketrams-v2-frontend\src\app\(dashboard)\
Rename-Item -Path subcounty -NewName treasury
Rename-Item -Path admin -NewName ministry
```

---

## Backend Changes 📋 REQUIRED

The backend requires the following changes (Spring Boot/Java):

### 1. Update Role Enum
**File: `Role.java`**
```java
public enum Role {
    STUDENT,
    INSTITUTION,
    TREASURY,           // Changed from SUB_COUNTY
    MINISTRY_OFFICER    // Changed from ADMIN
}
```

### 2. Update SecurityConfig
**File: `SecurityConfig.java`**

Replace all role references in `.hasRole()` and `.requestMatchers()`:
```java
// OLD:
// .hasRole("SUB_COUNTY")
// .hasRole("ADMIN")
// .requestMatchers("/api/subcounty/**").hasRole("SUB_COUNTY")
// .requestMatchers("/api/admin/**").hasRole("ADMIN")

// NEW:
.hasRole("TREASURY")
.hasRole("MINISTRY_OFFICER") 
.requestMatchers("/api/treasury/**").hasRole("TREASURY")
.requestMatchers("/api/ministry/**").hasRole("MINISTRY_OFFICER")
```

### 3. Update AuthController
**File: `AuthController.java`**

- Update login response to use new role names
- Update `@PreAuthorize` annotations:
```java
// OLD:
// @PreAuthorize("hasRole('ADMIN')")
// @PreAuthorize("hasRole('SUB_COUNTY')")

// NEW:
@PreAuthorize("hasRole('MINISTRY_OFFICER')")
@PreAuthorize("hasRole('TREASURY')")
```

- When user role is `TREASURY`, set `subCounty` from user's jurisdiction (keep field name `subCounty`)

### 4. Rename Controllers
**Find and rename controllers:** (Update class names, `@RequestMapping` paths, and `@PreAuthorize` annotations)

**Treasury Controllers (formerly SubCounty):**
```
SubCountyDashboardController → TreasuryDashboardController
  @RequestMapping("/api/treasury/dashboard")
  @PreAuthorize("hasRole('TREASURY')")

SubCountyApplicationsController → TreasuryApplicationsController
  @RequestMapping("/api/treasury/applications")
  @PreAuthorize("hasRole('TREASURY')")

SubCountyReportsController → TreasuryReportsController
  @RequestMapping("/api/treasury/reports")
  @PreAuthorize("hasRole('TREASURY')")

SubCountyStaffController → TreasuryStaffController
  @RequestMapping("/api/treasury/staff")
  @PreAuthorize("hasRole('TREASURY')")

SubCountyAssetsController → TreasuryAssetsController
  @RequestMapping("/api/treasury/assets")
  @PreAuthorize("hasRole('TREASURY')")
```

**Ministry Controllers (formerly Admin):**
```
AdminController → MinistryController
  @RequestMapping("/api/ministry")
  @PreAuthorize("hasRole('MINISTRY_OFFICER')")

AdminInstitutionRequestsController → MinistryInstitutionRequestsController
  @RequestMapping("/api/ministry/institution-requests")
  @PreAuthorize("hasRole('MINISTRY_OFFICER')")

AdminInstitutionUsersController → MinistryInstitutionUsersController
  @RequestMapping("/api/ministry/institution-users")
  @PreAuthorize("hasRole('MINISTRY_OFFICER')")

AdminDashboardController → MinistryDashboardController
  @RequestMapping("/api/ministry/dashboard")
  @PreAuthorize("hasRole('MINISTRY_OFFICER')")
```

### 5. Update AppUser Entity
**File: `AppUser.java`**

- Keep the `subCounty` field - it will be used for TREASURY users' jurisdiction
- No changes needed to the field itself

### 6. Update DataLoader
**File: `DataLoader.java`**

Update test/seed data creation:
```java
// OLD:
// user.setRole(Role.SUB_COUNTY);

// NEW:
user.setRole(Role.TREASURY);
user.setSubCounty(appropriateSubCounty); // Set jurisdiction
```

Similarly for admin/ministry users:
```java
// OLD:
// user.setRole(Role.ADMIN);

// NEW:
user.setRole(Role.MINISTRY_OFFICER);
```

### 7. Update Repository Methods
**File: `UserRepository.java`** and similar repository files

Update query methods:
```java
// OLD:
// List<AppUser> findByRole(Role.SUB_COUNTY);
// List<AppUser> findByRole(Role.ADMIN);

// NEW:
List<AppUser> findByRole(Role.TREASURY);
List<AppUser> findByRole(Role.MINISTRY_OFFICER);
```

### 8. Update DTOs
**File: `JwtResponse.java`** and similar DTO files

- No change needed to `subCounty` field - it will still work
- Verify role field contains correct enum values in response
- Update any role-specific documentation/comments

---

## Database Migration

### SQL UPDATE Statements

Run these statements to update existing users in the database:

```sql
-- Update existing SUB_COUNTY users to TREASURY
UPDATE app_user 
SET role = 'TREASURY' 
WHERE role = 'SUB_COUNTY';

-- Update existing ADMIN users to MINISTRY_OFFICER
UPDATE app_user 
SET role = 'MINISTRY_OFFICER' 
WHERE role = 'ADMIN';

-- Verify the updates
SELECT role, COUNT(*) FROM app_user GROUP BY role;
```

### For JPA Enum-backed Columns

If your role column uses enum ordinal/string storage, the above SQL should work directly. If using a separate lookup table:

```sql
-- Update role lookup table mappings if applicable
UPDATE role_mapping 
SET role_name = 'TREASURY' 
WHERE role_name = 'SUB_COUNTY';

UPDATE role_mapping 
SET role_name = 'MINISTRY_OFFICER' 
WHERE role_name = 'ADMIN';
```

---

## Testing Checklist

### Frontend Tests
- [ ] Login with TREASURY user and verify dashboard loads
- [ ] Login with MINISTRY_OFFICER user and verify dashboard loads
- [ ] Verify sidebar navigation shows correct items
- [ ] Check all API endpoint calls are working
- [ ] Verify role-based access control

### Backend Tests
- [ ] Test login endpoint returns correct role names
- [ ] Test authorization on treasury endpoints
- [ ] Test authorization on ministry endpoints
- [ ] Verify database migration completed successfully
- [ ] Test user creation with new roles
- [ ] Run existing unit tests and update role references

### API Tests
- [ ] Test all `/treasury/` endpoints
- [ ] Test all `/ministry/` endpoints
- [ ] Verify old `/subcounty/` and `/admin/` endpoints return 404 or redirect
- [ ] Check JWT token contains correct role

---

## Rollback Plan

If issues occur, you can quickly rollback:

### Database Rollback
```sql
UPDATE app_user 
SET role = 'SUB_COUNTY' 
WHERE role = 'TREASURY';

UPDATE app_user 
SET role = 'ADMIN' 
WHERE role = 'MINISTRY_OFFICER';
```

### Code Rollback
Revert git commits or restore from backup before migration.

---

## Summary of Changes

| Component | Old Value | New Value |
|-----------|-----------|-----------|
| **Role Enum** | `SUB_COUNTY`, `ADMIN` | `TREASURY`, `MINISTRY_OFFICER` |
| **Frontend Routes** | `/subcounty/*`, `/admin/*` | `/treasury/*`, `/ministry/*` |
| **API Endpoints** | `/api/subcounty/`, `/api/admin/` | `/api/treasury/`, `/api/ministry/` |
| **Controller Names** | `SubCounty*`, `Admin*` | `Treasury*`, `Ministry*` |
| **User Field** | `subCounty` (kept) | `subCounty` (kept) |
| **Database Column** | Unchanged | Unchanged |

---

## Questions?

For issues with specific files or implementation details, refer to this guide and the detailed changes documented in each section.
