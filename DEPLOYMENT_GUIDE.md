# Firebase Security Rules Deployment Guide
## Manual Deployment (No CLI Required)

This guide provides step-by-step instructions for deploying Firebase security rules using only the Firebase Console web interface.

---

## Prerequisites

1. Firebase project created
2. Access to Firebase Console with appropriate permissions
3. Firestore Database enabled
4. Firebase Storage enabled

---

## Step 1: Deploy Firestore Security Rules

### Instructions:

1. **Open Firebase Console**
   - Go to https://console.firebase.google.com/
   - Select your project

2. **Navigate to Firestore Rules**
   - Click **Firestore Database** in the left sidebar
   - Click on the **Rules** tab at the top

3. **Copy Rules Content**
   - Open the `firestore.rules` file from this project
   - Select all content (Ctrl+A / Cmd+A)
   - Copy (Ctrl+C / Cmd+C)

4. **Paste in Firebase Console**
   - Click in the rules editor
   - Select all existing content
   - Paste the new rules (Ctrl+V / Cmd+V)

5. **Review Rules**
   - Check for any syntax errors (red underlines)
   - Verify the rules match your requirements

6. **Publish Rules**
   - Click the **Publish** button
   - Confirm the action
   - Wait for "Rules published successfully" message

7. **Verify Deployment**
   - Rules should be active immediately
   - Test with a simple read operation from your app

---

## Step 2: Create Firestore Indexes

### Instructions:

1. **Navigate to Indexes**
   - In Firestore Database, click the **Indexes** tab

2. **Create Each Index** (Repeat for all 16 indexes)

   For each index below, follow these steps:
   - Click **Create Index** button
   - Fill in the fields as specified
   - Click **Create**
   - Wait for index to build (status will show "Building" then "Enabled")

### Index List:

#### Index 1: Patients by NIC
```
Collection ID: patients
Fields:
  - nic (Ascending)
  - isDeleted (Ascending)
Query scope: Collection
```

#### Index 2: Patients by Created Date
```
Collection ID: patients
Fields:
  - isDeleted (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

#### Index 3: Samples by Created Date
```
Collection ID: samples
Fields:
  - isDeleted (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

#### Index 4: Samples by Patient and Status
```
Collection ID: samples
Fields:
  - patient_id (Ascending)
  - status (Ascending)
Query scope: Collection
```

#### Index 5: Test Orders by Created Date
```
Collection ID: testOrders
Fields:
  - isDeleted (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

#### Index 6: Test Orders by Patient and Status
```
Collection ID: testOrders
Fields:
  - patient_id (Ascending)
  - status (Ascending)
Query scope: Collection
```

#### Index 7: Test Results by Order
```
Collection ID: testResults
Fields:
  - test_order_id (Ascending)
  - isDeleted (Ascending)
  - createdAt (Ascending)
Query scope: Collection
```

#### Index 8: Test Results by Status
```
Collection ID: testResults
Fields:
  - status (Ascending)
  - isDeleted (Ascending)
  - createdAt (Ascending)
Query scope: Collection
```

#### Index 9: Inventory by Status
```
Collection ID: inventory
Fields:
  - status (Ascending)
  - isDeleted (Ascending)
  - quantity (Ascending)
Query scope: Collection
```

#### Index 10: Inventory by Created Date
```
Collection ID: inventory
Fields:
  - isDeleted (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

#### Index 11: Invoices by Patient
```
Collection ID: invoices
Fields:
  - patient_id (Ascending)
  - isDeleted (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

#### Index 12: Invoices by Created Date
```
Collection ID: invoices
Fields:
  - isDeleted (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

#### Index 13: Reports by Patient
```
Collection ID: reports
Fields:
  - patient_id (Ascending)
  - isDeleted (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

#### Index 14: Activity Logs by User
```
Collection ID: activityLogs
Fields:
  - user_id (Ascending)
  - timestamp (Descending)
Query scope: Collection
```

#### Index 15: Activity Logs by Entity
```
Collection ID: activityLogs
Fields:
  - entity_type (Ascending)
  - entity_id (Ascending)
  - timestamp (Descending)
Query scope: Collection
```

#### Index 16: Activity Logs by Timestamp
```
Collection ID: activityLogs
Fields:
  - timestamp (Descending)
Query scope: Collection
```

**Note:** Index building can take 5-15 minutes. You can continue using the app while indexes build, but queries requiring those indexes will fail until they're ready.

---

## Step 3: Deploy Storage Security Rules

### Instructions:

1. **Navigate to Storage**
   - Click **Storage** in the left sidebar
   - Click on the **Rules** tab at the top

2. **Copy Rules Content**
   - Open the `firebase-storage.rules` file from this project
   - Select all content (Ctrl+A / Cmd+A)
   - Copy (Ctrl+C / Cmd+C)

3. **Paste in Firebase Console**
   - Click in the rules editor
   - Select all existing content
   - Paste the new rules (Ctrl+V / Cmd+V)

4. **Review Rules**
   - Check for any syntax errors
   - Verify file paths and permissions

5. **Publish Rules**
   - Click the **Publish** button
   - Confirm the action
   - Wait for success message

6. **Verify Deployment**
   - Test file upload in your application
   - Check that file type and size restrictions work

---

## Verification Checklist

After deployment, verify the following:

- [ ] Firestore rules are published and active
- [ ] All 16 indexes are created (status: "Enabled")
- [ ] Storage rules are published and active
- [ ] Admin user can access all collections
- [ ] Staff can create patients but not users
- [ ] Doctors can approve results but not create patients
- [ ] Patients can only read their own data
- [ ] File uploads respect size and type limits
- [ ] Soft delete protection is working
- [ ] Activity logs are being created

---

## Troubleshooting

### Rules Not Working

1. **Check Rules Syntax**
   - Look for red underlines in Firebase Console
   - Common issues: missing commas, typos in field names

2. **Verify User Status**
   - Check that user document has `status: "Active"`
   - Check that user document has correct `role`

3. **Check Authentication**
   - Ensure user is logged in
   - Verify Firebase Auth is working

4. **Clear Browser Cache**
   - Sometimes rules take a moment to propagate
   - Try incognito/private browsing mode

### Index Errors

1. **"Index not found" Error**
   - Wait for index to finish building
   - Check index status in Firebase Console
   - Verify all fields are correct

2. **Slow Queries**
   - Check if required indexes are built
   - Review query patterns
   - Consider adding additional indexes

### Storage Errors

1. **"Permission denied" Error**
   - Check file type matches rules (PDF, images)
   - Verify file size is within limits
   - Check user role has write permissions

2. **"File too large" Error**
   - Reports: Max 10MB
   - Profile images: Max 2MB
   - Sample attachments: Max 5MB

---

## Backup Current Rules

**Before making changes, always backup:**

1. **Firestore Rules:**
   - Go to Firestore Database > Rules
   - Copy all content
   - Save to a backup file

2. **Storage Rules:**
   - Go to Storage > Rules
   - Copy all content
   - Save to a backup file

3. **Index List:**
   - Go to Firestore Database > Indexes
   - Take screenshots or note down all indexes
   - Document any custom indexes

---

## Maintenance

### Regular Tasks

- **Weekly:** Review activity logs for unauthorized access attempts
- **Monthly:** Audit user roles and permissions
- **Quarterly:** Review and update security rules
- **As Needed:** Add indexes for new query patterns

### Updating Rules

1. Backup current rules
2. Make changes in local files first
3. Test changes (if possible)
4. Update rules in Firebase Console
5. Verify functionality
6. Document changes

---

## Support

If you encounter issues:

1. Check Firebase Console for error messages
2. Review browser console for client-side errors
3. Verify user authentication status
4. Check Firestore/Storage usage quotas
5. Review Firebase documentation
6. Contact Firebase support if needed

---

## Quick Reference

**Firestore Rules Location:**
- Console: Firestore Database > Rules
- File: `firestore.rules`

**Storage Rules Location:**
- Console: Storage > Rules
- File: `firebase-storage.rules`

**Indexes Location:**
- Console: Firestore Database > Indexes
- File: `firestore.indexes.json` (reference only)

**Deployment Time:**
- Rules: Immediate (few seconds)
- Indexes: 5-15 minutes per index
- Storage Rules: Immediate (few seconds)

