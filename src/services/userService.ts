import { auth, db } from '../firebase';
import { signOut, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export const fetchUserData = async (uid: string) => {
	const docSnap = await getDoc(doc(db, "users", uid));
	return docSnap.exists() ? docSnap.data() : null;
};

export const logoutUser = async () => {
	const currentUser = auth.currentUser;
	if (currentUser) {
		await updateDoc(doc(db, 'users', currentUser.uid), {
			isLoggedIn: false,
			lastLogout: serverTimestamp()
		});
	}
	await signOut(auth);
	localStorage.removeItem("token");
};

export const resendVerificationEmail = async () => {
	const currentUser = auth.currentUser;
	if (currentUser && !currentUser.emailVerified) {
		await sendEmailVerification(currentUser);
		return true;
	}
	return false;
};

export const updateUserName = async (newName: string) => {
	const currentUser = auth.currentUser;
	if (currentUser) {
		await updateProfile(currentUser, { displayName: newName });
		await updateDoc(doc(db, "users", currentUser.uid), {
			name: newName,
			updatedAt: serverTimestamp()
		});
		return true;
	}
	return false;
};
