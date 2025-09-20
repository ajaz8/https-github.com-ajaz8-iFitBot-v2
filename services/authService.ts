// services/authService.ts
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// 🔹 Google login
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  const user = result.user;

  // Save user to Firestore (if new)
  await setDoc(doc(db, "users", user.uid), {
    name: user.displayName,
    email: user.email,
    createdAt: new Date(),
  }, { merge: true }); // merge = don’t overwrite if user already exists

  return user;
}
