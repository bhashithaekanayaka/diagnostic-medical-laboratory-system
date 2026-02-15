# Diagnostic Medical Laboratory Management System

A full-stack web-based Laboratory Management System (LMS) built with React, Firebase, and Tailwind CSS.

## Features

- **Role-Based Access Control (RBAC)**: Admin, Doctor, Technician/Staff, and Patient roles
- **Patient Management**: Registration with validation (FR-1 to FR-8), duplicate NIC prevention, auto-generated Patient IDs
- **Sample Collection**: Unique Sample ID generation, status lifecycle management
- **Test Order Management**: Test order creation and workflow state control
- **Result Entry**: Numeric result entry with validation ranges, draft saving, approval workflow
- **Doctor Approval**: View pending results, approve/reject with mandatory rejection reasons
- **Inventory Management**: CRUD operations, quantity tracking, reorder level alerts, expiry monitoring
- **Invoice Management**: Invoice creation linked to patients/test orders, LKR currency formatting, status tracking
- **Report Generation**: PDF report generation with Firestore metadata and Firebase Storage
- **Audit Logging**: Comprehensive activity logging for all critical operations
- **Soft Delete**: All records use soft delete flags instead of hard deletion

## Tech Stack

- **Frontend**: React 19, React Router DOM 7, Tailwind CSS 4
- **Backend**: Firebase (Authentication, Firestore, Storage, Functions)
- **UI Components**: Custom components with Tailwind CSS
- **State Management**: React Context API
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 18+ and npm
- Firebase project with:
  - Authentication (Email/Password enabled)
  - Firestore Database
  - Storage
  - Functions (optional)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd diagnostic-medical-laboratory-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication in Authentication > Sign-in method
3. Create a Firestore database
4. Enable Storage
5. Copy your Firebase configuration from Project Settings > General

### 4. Create environment file

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 5. Set up Firestore Security Rules

Configure Firestore Security Rules to enforce RBAC. Example rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
    }
    
    // Patients collection
    match /patients/{patientId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['Admin', 'Technician', 'Staff']);
      allow update, delete: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['Admin', 'Technician', 'Staff']);
    }
    
    // Add similar rules for other collections
  }
}
```

### 6. Create initial admin user

1. Create a user in Firebase Authentication
2. Create a corresponding document in Firestore `users` collection:

```javascript
{
  user_id: "firebase-auth-uid",
  full_name: "Admin User",
  email: "admin@example.com",
  role: "Admin",
  status: "Active",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### 7. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable components
│   ├── common/      # Common components (Header, Sidebar, etc.)
│   ├── forms/       # Form components
│   └── ui/          # UI components (Button, Input, etc.)
├── config/          # Configuration files (Firebase)
├── context/         # React Context providers
├── hooks/           # Custom React hooks
├── layouts/         # Layout components
├── pages/           # Page components
│   ├── admin/       # Admin pages
│   ├── auth/        # Authentication pages
│   ├── doctor/      # Doctor pages
│   ├── patient/     # Patient pages
│   └── staff/       # Staff pages
├── router/          # Routing configuration
├── services/        # Firebase service abstractions
└── utils/           # Utility functions
```

## Key Features Implementation

### Patient Registration (FR-1 to FR-8)

- **FR-1**: NIC format validation (9 digits with V/X or 12 digits)
- **FR-2**: Duplicate NIC prevention
- **FR-3**: Auto-generated Patient ID (PAT-YYYYMMDD-XXXX)
- **FR-4**: Required field validation
- **FR-5**: Phone number format validation
- **FR-6**: Email format validation
- **FR-7**: Date of birth validation (must be in past)
- **FR-8**: Default status set to Active

### Status Lifecycle

- **Samples**: Pending → Collected → Rejected/Processed
- **Test Orders**: Pending → In Progress → Completed/Cancelled
- **Test Results**: Draft → Pending Approval → Approved/Rejected/Returned
- **Invoices**: Pending → Paid/Partial/Overdue/Cancelled

### Audit Logging

All critical operations are logged to the `activityLogs` collection with:
- `log_id`: Unique log identifier
- `user_id`: User who performed the action
- `entity_type`: Type of entity (patient, test, invoice, etc.)
- `action`: Action performed (create, update, delete, approve, reject)
- `entity_id`: ID of the affected entity
- `details`: Additional details
- `timestamp`: When the action occurred

## Security Features

- Role-based access control (RBAC)
- Firestore Security Rules enforcement
- Input validation to prevent injection/XSS
- HTTPS-only communication
- Soft delete instead of hard deletion
- Audit logging for all critical operations

## Development

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint code

```bash
npm run lint
```

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please contact the development team.
