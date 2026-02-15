# Environment Variables Setup

## Create .env File

Create a `.env` file in the root directory of your project with the following content:

```env
# Firebase Configuration
# DO NOT commit this file to version control - it contains sensitive credentials

VITE_FIREBASE_API_KEY=AIzaSyAXFl2LpEJAh4cbCWG85BrU6qOpfPVwUNM
VITE_FIREBASE_AUTH_DOMAIN=diagnostic-medical-lab.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=diagnostic-medical-lab
VITE_FIREBASE_STORAGE_BUCKET=diagnostic-medical-lab.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=992175357838
VITE_FIREBASE_APP_ID=1:992175357838:web:c44062f96de66268e46edf

# Optional: Analytics Measurement ID (if you want to use it)
VITE_FIREBASE_MEASUREMENT_ID=G-EE2DYMHDBN
```

## Instructions

1. **Create the file:**
   - In your project root directory, create a new file named `.env`
   - Copy the content above into the file

2. **Verify .gitignore:**
   - Make sure `.env` is in your `.gitignore` file
   - This prevents committing sensitive credentials to version control

3. **Restart Development Server:**
   - After creating the `.env` file, restart your Vite dev server
   - Run: `npm run dev`

4. **Verify Configuration:**
   - The app should now connect to your Firebase project
   - Check the browser console for any Firebase initialization errors

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to Git
- Never share your Firebase API keys publicly
- The `.env` file is already in `.gitignore` for your protection
- If you need to share the project, use `.env.example` as a template

## Troubleshooting

If you see "Missing Firebase environment variables" error:
1. Verify the `.env` file exists in the project root
2. Check that all variable names start with `VITE_`
3. Ensure there are no spaces around the `=` sign
4. Restart your development server after creating/updating `.env`

