# Development Setup Guide

## Quick Login for Development

The login page includes a development-only quick login section that allows you to quickly test different user roles without manually entering credentials.

### Setting Up Test Accounts

To use the quick login feature, you need to create test user accounts in Firebase Authentication:

1. **Go to Firebase Console**
   - Navigate to Authentication > Users
   - Click "Add user"

2. **Create Test Accounts**

   Create the following test users:

   | Role | Email | Password |
   |------|-------|----------|
   | Admin | admin@test.com | admin123 |
   | Doctor | doctor@test.com | doctor123 |
   | Staff | staff@test.com | staff123 |
   | Technician | technician@test.com | tech123 |
   | Patient | patient@test.com | patient123 |

3. **Create User Documents in Firestore**

   For each test user, create a corresponding document in the `users` collection:

   **Admin User:**
   ```javascript
   {
     user_id: "firebase-auth-uid-here",
     full_name: "Admin User",
     email: "admin@test.com",
     role: "Admin",
     status: "Active",
     phone: "",
     createdAt: serverTimestamp(),
     updatedAt: serverTimestamp()
   }
   ```

   **Doctor User:**
   ```javascript
   {
     user_id: "firebase-auth-uid-here",
     full_name: "Doctor User",
     email: "doctor@test.com",
     role: "Doctor",
     status: "Active",
     phone: "",
     createdAt: serverTimestamp(),
     updatedAt: serverTimestamp()
   }
   ```

   **Staff User:**
   ```javascript
   {
     user_id: "firebase-auth-uid-here",
     full_name: "Staff User",
     email: "staff@test.com",
     role: "Staff",
     status: "Active",
     phone: "",
     createdAt: serverTimestamp(),
     updatedAt: serverTimestamp()
   }
   ```

   **Technician User:**
   ```javascript
   {
     user_id: "firebase-auth-uid-here",
     full_name: "Technician User",
     email: "technician@test.com",
     role: "Technician",
     status: "Active",
     phone: "",
     createdAt: serverTimestamp(),
     updatedAt: serverTimestamp()
   }
   ```

   **Patient User:**
   ```javascript
   {
     user_id: "firebase-auth-uid-here",
     full_name: "Patient User",
     email: "patient@test.com",
     role: "Patient",
     status: "Active",
     phone: "",
     createdAt: serverTimestamp(),
     updatedAt: serverTimestamp()
   }
   ```

   **Important:** Replace `"firebase-auth-uid-here"` with the actual UID from Firebase Authentication for each user.

### Using Quick Login

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to Login Page**
   - The quick login section appears automatically in development mode
   - It's located below the regular login form

3. **Click Role Buttons**
   - Click any role button (Admin, Doctor, Staff, Technician, Patient)
   - The system will automatically log you in with the corresponding test account
   - You'll be redirected to the appropriate dashboard

### Customizing Test Accounts

To change test account credentials, edit `src/pages/auth/Login.jsx`:

```javascript
const TEST_ACCOUNTS = {
  admin: {
    email: 'your-admin@email.com',
    password: 'your-password',
    role: ROLES.ADMIN,
  },
  // ... other roles
}
```

### Security Notes

⚠️ **Important:**
- Quick login is **ONLY** available in development mode
- It will **NOT** appear in production builds
- Never commit test account credentials to production
- Test accounts should have limited permissions in production Firebase projects

### Troubleshooting

**Quick login not appearing:**
- Ensure you're running in development mode (`npm run dev`)
- Check that `import.meta.env.DEV` is `true`

**Quick login fails:**
- Verify test accounts exist in Firebase Authentication
- Verify user documents exist in Firestore `users` collection
- Check that `user_id` in Firestore matches Firebase Auth UID
- Ensure user status is "Active"

**Wrong dashboard after login:**
- Verify the `role` field in Firestore matches the expected role
- Check that user status is "Active"
- Clear browser cache and try again

### Production Build

When building for production:
```bash
npm run build
```

The quick login section will **automatically be excluded** from the production build, so you don't need to remove it manually.

