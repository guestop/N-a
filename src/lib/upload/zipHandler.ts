import { doc, setDoc, Timestamp, collection } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, App } from "@/lib/firebase/firestore";
import { storage } from "@/lib/firebase/storage";

export const uploadZipAndCreateApp = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  // Generate a unique app ID natively through Firestore
  const appRef = doc(collection(db, "apps"));
  const appId = appRef.id;

  // Enforce correct storage path as requested: uploads/{userId}/{appId}/{filename}
  const storagePath = `uploads/${userId}/${appId}/${file.name}`;
  const storageRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (onProgress) {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        }
      },
      (error) => {
        reject(new Error(`Upload failed: ${error.message}`));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Save the app metadata strictly implementing the App interface
          const newApp: App = {
            id: appId,
            title: file.name.replace(/\.zip$/i, ""),
            publisherId: userId,
            appUrl: downloadURL,
            status: "draft",
            views: 0,
            createdAt: Timestamp.now(),
          };

          await setDoc(appRef, newApp);
          resolve(downloadURL);
        } catch (dbError: unknown) {
          reject(new Error(dbError instanceof Error ? dbError.message : "Failed to save app metadata."));
        }
      }
    );
  });
};
