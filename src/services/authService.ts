import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, deleteUser, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

export const registerUser = async (email: string, password: string) => {
	const userData = await createUserWithEmailAndPassword(auth, email, password);
	if (userData.user.uid) {
		try {
			await setDoc(doc(db, 'users', userData.user.uid), {
				uid: userData.user.uid,
				email: userData.user.email,
				name: 'user',
				isVerified: false,
				isLoggedIn: false,
				lastLogin: serverTimestamp(),
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp()
			});
			await sendEmailVerification(userData.user);
			await signOut(auth);
			return { success: true, message: "Registration Success. Please verify your email." };
		} catch (error) {
			await deleteUser(userData.user);
			throw new Error("Failed to create user document. Please try again.");
		}
	}
	throw new Error("Registration failed.");
};

export const loginUser = async (email: string, password: string) => {
	const data = await signInWithEmailAndPassword(auth, email, password);
	const user = data.user;
	const token = await user.getIdToken();
	localStorage.setItem("token", token);
	if (user.emailVerified) {
		const userRef = doc(db, 'users', user.uid);
		await updateDoc(userRef, {
			isVerified: true,
			isLoggedIn: true,
			lastLogin: serverTimestamp()
		});
		return { success: true, user };
	} else {
		throw new Error("Please verify your email before logging in.");
	}
};
