# Firebase Security Rules Setup Guide

This document provides production-level Firestore Security Rules and Storage Rules for the Diagnostic Medical Laboratory Management System.

## Files Included

1. **firestore.rules** - Complete Firestore Security Rules
2. **firestore.indexes.json** - Required Firestore indexes for optimal query performance
3. **firebase-storage.rules** - Firebase Storage Security Rules
4. **FIREBASE_SECURITY_SETUP.md** - This setup guide

## Deployment Instructions (Firebase Console - No CLI Required)

### 1. Deploy Firestore Security Rules

**Manual Deployment via Firebase Console:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Open the `firestore.rules` file from this project
6. Copy the entire content
7. Paste it into the Firebase Console Rules editor
8. Click **Publish** button
9. Review the changes and confirm

**Important:** After publishing, wait a few seconds for the rules to propagate.

### 2. Deploy Firestore Indexes

**Manual Deployment via Firebase Console:**

1. Go to **Firestore Database** > **Indexes** tab
2. Click **Create Index** button
3. For each index in `firestore.indexes.json`, create manually:

**Index 1: Patients by NIC**
- Collection ID: `patients`
- Fields to index:
  - `nic` (Ascending)
  - `isDeleted` (Ascending)
- Query scope: Collection
- Click **Create**

**Index 2: Patients by Created Date**
- Collection ID: `patients`
- Fields to index:
  - `isDeleted` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection
- Click **Create**

**Index 3: Samples by Created Date**
- Collection ID: `samples`
- Fields to index:
  - `isDeleted` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection
- Click **Create**

**Index 4: Samples by Patient and Status**
- Collection ID: `samples`
- Fields to index:
  - `patient_id` (Ascending)
  - `status` (Ascending)
- Query scope: Collection
- Click **Create**

**Index 5: Test Orders by Created Date**
- Collection ID: `testOrders`
- Fields to index:
  - `isDeleted` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection
- Click **Create**

**Index 6: Test Orders by Patient and Status**
- Collection ID: `testOrders`
- Fields to index:
  - `patient_id` (Ascending)
  - `status` (Ascending)
- Query scope: Collection
- Click **Create**

**Index 7: Test Results by Order**
- Collection ID: `testResults`
- Fields to index:
  - `test_order_id` (Ascending)
  - `isDeleted` (Ascending)
  - `createdAt` (Ascending)
- Query scope: Collection
- Click **Create**

**Index 8: Test Results by Status**
- Collection ID: `testResults`
- Fields to index:
  - `status` (Ascending)
  - `isDeleted` (Ascending)
  - `createdAt` (Ascending)
- Query scope: Collection
- Click **Create**

**Index 9: Inventory by Status**
- Collection ID: `inventory`
- Fields to index:
  - `status` (Ascending)
  - `isDeleted` (Ascending)
  - `quantity` (Ascending)
- Query scope: Collection
- Click **Create**

**Index 10: Inventory by Created Date**
- Collection ID: `inventory`
- Fields to index:
  - `isDeleted` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection
- Click **Create**

**Index 11: Invoices by Patient**
- Collection ID: `invoices`
- Fields to index:
  - `patient_id` (Ascending)
  - `isDeleted` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection
- Click **Create**

**Index 12: Invoices by Created Date**
- Collection ID: `invoices`
- Fields to index:
  - `isDeleted` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection
- Click **Create**

**Index 13: Reports by Patient**
- Collection ID: `reports`
- Fields to index:
  - `patient_id` (Ascending)
  - `isDeleted` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection
- Click **Create**

**Index 14: Activity Logs by User**
- Collection ID: `activityLogs`
- Fields to index:
  - `user_id` (Ascending)
  - `timestamp` (Descending)
- Query scope: Collection
- Click **Create**

**Index 15: Activity Logs by Entity**
- Collection ID: `activityLogs`
- Fields to index:
  - `entity_type` (Ascending)
  - `entity_id` (Ascending)
  - `timestamp` (Descending)
- Query scope: Collection
- Click **Create**

**Index 16: Activity Logs by Timestamp**
- Collection ID: `activityLogs`
- Fields to index:
  - `timestamp` (Descending)
- Query scope: Collection
- Click **Create**

**Note:** Indexes may take several minutes to build. You'll see a status indicator showing "Building" until they're ready.

### 3. Deploy Storage Security Rules

**Manual Deployment via Firebase Console:**

1. Go to **Storage** in the left sidebar
2. Click on the **Rules** tab
3. Open the `firebase-storage.rules` file from this project
4. Copy the entire content
5. Paste it into the Firebase Console Rules editor
6. Click **Publish** button
7. Review the changes and confirm

**Important:** After publishing, wait a few seconds for the rules to propagate.

## Security Rules Overview

### Firestore Rules Features

#### Role-Based Access Control (RBAC)
- **Admin**: Full access to all collections
- **Doctor**: Read access to patients, samples, test orders, results; can approve/reject results
- **Technician/Staff**: Can create/update patients, samples, test orders, results; cannot approve
- **Patient**: Read-only access to their own invoices and reports

#### Collection-Specific Rules

1. **users**
   - Read: Users can read their own data; admins can read all
   - Create: Admins only
   - Update: Admins only
   - Delete: Hard delete not allowed (soft delete only)

2. **patients**
   - Read: Staff, doctors, admins
   - Create: Staff, technicians, admins
   - Update: Staff, technicians, admins
   - Validation: Required fields, status validation, NIC format

3. **samples**
   - Read: Staff, doctors, admins
   - Create: Staff, technicians, admins
   - Update: Staff, technicians, admins
   - Status validation: Pending, Collected, Rejected, Processed

4. **testOrders**
   - Read: Staff, doctors, admins
   - Create: Staff, technicians, admins
   - Update: Staff, technicians, admins
   - Validation: Tests array, status validation

5. **testResults**
   - Read: Staff, doctors, admins
   - Create: Staff, technicians, admins
   - Update: 
     - Staff: Can update Draft or Returned results
     - Doctors: Can approve/reject/return Pending Approval results
     - Admins: Can update any result (including approved)
   - Immutability: Approved results are immutable except by admin
   - Validation: Rejection requires reason, approval requires approved_by and approved_at

6. **inventory**
   - Read: Staff, doctors, admins
   - Create: Admins only
   - Update: Admins only
   - Validation: Quantity, reorder level, status

7. **invoices**
   - Read: Staff, doctors, admins; patients can read their own
   - Create: Staff, technicians, admins
   - Update: Staff, technicians, admins
   - Validation: Items array, totals, status

8. **reports**
   - Read: Staff, doctors, admins; patients can read their own
   - Create: Staff, doctors, admins
   - Update: Admins only
   - Validation: File URL, report type

9. **activityLogs**
   - Read: All authenticated users (for transparency)
   - Create: Authenticated users (should log their own actions)
   - Update: Not allowed (immutable)
   - Delete: Not allowed (permanent audit trail)

### Storage Rules Features

1. **Reports Storage** (`/reports/{reportId}/{fileName}`)
   - Read: Staff, doctors, admins; patients can read their own reports
   - Write: Staff, doctors, admins (PDF only, 10MB limit)
   - Delete: Admins only

2. **Profile Images** (`/profiles/{userId}/{fileName}`)
   - Read: Users can read their own; admins can read all
   - Write: Users can upload their own (images only, 2MB limit)
   - Delete: Users can delete their own; admins can delete any

3. **Sample Attachments** (`/samples/{sampleId}/{fileName}`)
   - Read: Staff, doctors, admins
   - Write: Staff, admins (images/PDF, 5MB limit)
   - Delete: Admins only

## Security Best Practices Implemented

1. **Authentication Required**: All operations require authenticated users
2. **Role-Based Access**: Strict RBAC enforcement
3. **Active Status Check**: Only active users can perform operations
4. **Soft Delete Protection**: Hard deletes are prevented
5. **Field Validation**: Required fields and data types are validated
6. **Immutable Fields**: Critical fields (IDs) cannot be modified
7. **Status Validation**: Only valid status values are allowed
8. **Timestamp Enforcement**: createdAt and updatedAt are required
9. **Audit Trail**: Activity logs are immutable and permanent
10. **File Type Validation**: Storage rules validate file types and sizes
11. **Size Limits**: File uploads have size restrictions
12. **Default Deny**: All unspecified access is denied

## Testing Security Rules

### Testing in Firebase Console

1. **Test Firestore Rules:**
   - Go to Firestore Database > Rules
   - Use the "Rules Playground" (if available) to test scenarios
   - Or test directly in your application

2. **Test Storage Rules:**
   - Go to Storage > Rules
   - Test file uploads/downloads in your application
   - Check console for permission errors

### Manual Testing Checklist

1. ✅ Admin can create/update/delete users
2. ✅ Staff can create patients but not users
3. ✅ Doctors can approve results but not create patients
4. ✅ Patients can only read their own invoices/reports
5. ✅ Approved results cannot be modified by staff
6. ✅ Soft delete prevents hard deletion
7. ✅ Invalid status values are rejected
8. ✅ Missing required fields are rejected
9. ✅ Unauthenticated users cannot access data
10. ✅ Inactive users cannot perform operations

## Monitoring and Alerts

### Recommended Firebase Alerts

1. **Failed Authentication Attempts**: Monitor for brute force attacks
2. **Rule Violations**: Monitor for denied access attempts
3. **Unusual Access Patterns**: Monitor for suspicious activity
4. **Storage Quota**: Monitor storage usage
5. **Firestore Reads/Writes**: Monitor for unusual spikes

### Setting Up Alerts

1. Go to Firebase Console > Project Settings > Alerts
2. Enable email notifications for:
   - Authentication failures
   - Security rule violations
   - Storage quota warnings
   - Firestore quota warnings

## Maintenance

### Regular Tasks

1. **Review Activity Logs**: Weekly review of activityLogs collection
2. **Audit User Access**: Monthly review of user roles and permissions
3. **Update Rules**: As new features are added, update rules accordingly
4. **Monitor Performance**: Check query performance and optimize indexes
5. **Security Updates**: Keep Firebase SDK and rules updated

### Version Control

- Keep security rules in version control (firestore.rules, firebase-storage.rules)
- Document all rule changes
- Test rules in staging before production deployment
- Before making changes, always backup current rules from Firebase Console
- Copy rules from Firebase Console to your local files after manual changes

## Troubleshooting

### Common Issues

1. **"Missing or insufficient permissions"**
   - Check user role in Firestore users collection
   - Verify user status is "Active"
   - Check if user is authenticated

2. **"Index not found"**
   - Deploy firestore.indexes.json
   - Wait for indexes to build (can take several minutes)

3. **"Storage permission denied"**
   - Check file type and size
   - Verify user role
   - Check file path matches rules

4. **"Cannot update approved result"**
   - Only admins can update approved results
   - Use admin override if needed

## Support

For security-related issues:
1. Review Firebase Console logs
2. Check activityLogs collection
3. Verify user roles and status
4. Test with Firebase Emulator
5. Contact system administrator

## Additional Security Recommendations

1. **Enable App Check**: Protect your app from abuse
2. **Use Cloud Functions**: Move sensitive operations to server-side
3. **Implement Rate Limiting**: Prevent abuse
4. **Regular Security Audits**: Quarterly security reviews
5. **Backup Rules**: Keep backups of all security rules
6. **Documentation**: Maintain up-to-date security documentation

