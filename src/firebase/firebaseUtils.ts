import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
// import { auth } from "./firebase";
const db = getFirestore();

// Create or update user document in Firestore
export const createUserInFirestore = async (userId: string, email: string) => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, {
      userId,
      email,
      username: "user", // Default username
      lastLogin: "",
      lastLogout: "",
    });
  }
};

// Update the lastLogin field in Firestore
export const updateLastLogin = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    lastLogin: new Date().toISOString(), // Set current date as lastLogin
  });
};

// Update the lastLogout field in Firestore
export const updateLastLogout = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    lastLogout: new Date().toISOString(), // Set current date as lastLogout
  });
};

// Get user data from Firestore
export const getUserData = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? userDoc.data() : null;
};

// Update username
export const updateUsername = async (userId: string, newUsername: string) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    username: newUsername,
  });
};
