export const APP_NAME = "UniversalApps";
export const APP_DESCRIPTION = "The ultimate universal web app marketplace. Run any project instantly in your browser.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Free Tier Constraints (Vercel Hobby / Firebase Spark)
export const MAX_PROJECT_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_PROJECTS_PER_USER = 10;

// Security
export const SANDBOX_PERMISSIONS = "allow-scripts allow-modals allow-popups allow-forms";
