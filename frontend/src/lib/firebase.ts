import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const isFirebaseConfigured =
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.startsWith('your-')

let app: FirebaseApp | null = null
let auth: Auth | null = null
let googleProvider: GoogleAuthProvider | null = null

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
}

export async function loginWithGoogle() {
  if (!auth || !googleProvider) throw new Error('Firebase is not configured')
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function loginWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase is not configured')
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function registerWithEmail(email: string, password: string, displayName?: string) {
  if (!auth) throw new Error('Firebase is not configured')
  const result = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName) {
    await updateProfile(result.user, { displayName })
  }
  return result.user
}

export async function logoutFirebase() {
  if (!auth) throw new Error('Firebase is not configured')
  await signOut(auth)
}

export async function getIdToken(user: FirebaseUser): Promise<string> {
  return user.getIdToken()
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  if (!auth) return () => {}
  return onAuthStateChanged(auth, callback)
}

export { auth }
