/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Debug check
if (!firebaseConfig || !firebaseConfig.apiKey) {
  console.error("Firebase configuration Error: apiKey is missing!", firebaseConfig);
}

const app = initializeApp(firebaseConfig);

// Using initializeFirestore instead of getFirestore to enable extra settings
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  host: 'firestore.googleapis.com',
  ssl: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

// Connectivity check
async function testConnection() {
  try {
    // Only try to test connection if we are not already getting timeout errors in the UI
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore is operating in offline mode. This might be due to a restrictive network or incorrect configuration.");
    }
  }
}
testConnection();
