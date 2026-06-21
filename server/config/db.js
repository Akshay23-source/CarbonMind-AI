import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let db;
let auth;

try {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(serviceAccountKey);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log('[Firebase Admin] Connected successfully to Cloud Firestore.');
  } else {
    // Offline development fallback log
    console.log('[Firebase Admin] Warning: Running in offline development mock mode. Provide FIREBASE_SERVICE_ACCOUNT_KEY to authenticate.');
  }

  db = admin.apps.length > 0 ? admin.firestore() : null;
  auth = admin.apps.length > 0 ? admin.auth() : null;

} catch (error) {
  console.error('[Firebase Admin] Initialization failed:', error);
}

export { db, auth };
export default admin;
