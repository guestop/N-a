"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { uploadZipAndCreateApp } from "@/lib/upload/zipHandler";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ["application/zip", "application/x-zip-compressed", "multipart/x-zip"];

export function ZipUploader() {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);

  const validateAndUpload = useCallback(
    async (file: File) => {
      setError(null);
      setSuccessUrl(null);

      if (!user) {
        setError("You must be logged in to upload an app.");
        return;
      }

      if (!file.name.toLowerCase().endsWith(".zip") || (!ALLOWED_TYPES.includes(file.type) && file.type !== "")) {
        setError("Invalid file type. Only .zip files are allowed.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`File is too large. Max size is 50MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
        return;
      }

      try {
        setUploadProgress(0);
        const url = await uploadZipAndCreateApp(file, user.uid, (progress) => {
          setUploadProgress(progress);
        });
        setSuccessUrl(url);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred during upload.");
      } finally {
        setUploadProgress(null);
      }
    },
    [user]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        validateAndUpload(file);
      }
    },
    [validateAndUpload]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndUpload(file);
    }
  };

  if (!user) {
    return <p className="text-sm font-medium text-slate-500">Please log in to upload an app.</p>;
  }

  return (
    <div className="w-full max-w-xl mx-auto py-6">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"
        }`}
      >
        <input
          type="file"
          accept=".zip,application/zip"
          onChange={onFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploadProgress !== null}
        />

        <svg
          className="w-12 h-12 text-slate-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>

        <p className="text-lg font-semibold text-slate-700">Drop your .zip file here</p>
        <p className="text-sm text-slate-500 mt-1">or click to browse (Max 50MB)</p>
      </div>

      {uploadProgress !== null && (
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-blue-700">Uploading App...</span>
            <span className="text-sm font-semibold text-blue-700">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-800 text-sm rounded-lg border border-red-200">
          <p className="font-semibold mb-1">Upload Error</p>
          <p>{error}</p>
        </div>
      )}

      {successUrl && (
        <div className="mt-6 p-4 bg-green-50 text-green-800 text-sm rounded-lg border border-green-200">
          <p className="font-semibold mb-1">Upload Successful!</p>
          <p>Your app has been saved securely to Firebase. It is currently in draft mode.</p>
        </div>
      )}
    </div>
  );
}
