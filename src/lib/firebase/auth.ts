import { getAuth, GithubAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { app } from "./config";
import { db } from "./firestore";

export const auth = getAuth(app);

const githubProvider = new GithubAuthProvider();
// Request additional scopes to retrieve the email
githubProvider.addScope("read:user");
githubProvider.addScope("user:email");

export const signInWithGithub = async (): Promise<FirebaseUser> => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;
    
    const credential = GithubAuthProvider.credentialFromResult(result);
    if (credential && credential.accessToken) {
      sessionStorage.setItem("githubToken", credential.accessToken);
    }

    // After login: save user to Firestore or update lastLogin
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      await setDoc(userRef, { lastLogin: Timestamp.now() }, { merge: true });
    } else {
      await setDoc(userRef, {
        uid: user.uid,
        username: user.displayName || user.email?.split("@")[0] || "User",
        email: user.email || "",
        avatar: user.photoURL || null,
        bio: null,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
      });
    }

    return user;
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "auth/popup-blocked") {
        throw new Error("Popup blocked by the browser. Please allow popups for this site.");
      } else if (code === "auth/popup-closed-by-user") {
        throw new Error("Login cancelled.");
      } else if (code === "auth/network-request-failed") {
        throw new Error("Network error. Please check your connection.");
      }
    }
    throw new Error(error instanceof Error ? error.message : "Failed to sign in with GitHub.");
  }
};

export const logout = async (): Promise<void> => {
  sessionStorage.removeItem("githubToken");
  await signOut(auth);
};
