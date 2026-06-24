import { collection, query, where, orderBy, limit, getDocs, QueryConstraint } from "firebase/firestore";
import { db, App, getUser } from "@/lib/firebase/firestore";

export interface AppWithPublisher extends App {
  publisherName: string;
}

/**
 * Helper to fetch publisher names for a list of apps
 */
async function attachPublishers(apps: App[]): Promise<AppWithPublisher[]> {
  const publishersCache: Record<string, string> = {};
  
  const appsWithPublishers = await Promise.all(
    apps.map(async (app) => {
      let publisherName = publishersCache[app.publisherId];
      if (!publisherName) {
        const user = await getUser(app.publisherId);
        publisherName = user?.username || "Unknown Publisher";
        publishersCache[app.publisherId] = publisherName;
      }
      return { ...app, publisherName };
    })
  );

  return appsWithPublishers;
}

/**
 * Get top 6 featured apps based on views
 */
export const getFeaturedApps = async (): Promise<AppWithPublisher[]> => {
  const q = query(
    collection(db, "apps"),
    where("status", "==", "published"),
    orderBy("views", "desc"),
    limit(6)
  );
  
  const snapshot = await getDocs(q);
  const apps = snapshot.docs.map(doc => doc.data() as App);
  return attachPublishers(apps);
};

/**
 * Get 8 newest apps
 */
export const getNewApps = async (): Promise<AppWithPublisher[]> => {
  const q = query(
    collection(db, "apps"),
    where("status", "==", "published"),
    orderBy("createdAt", "desc"),
    limit(8)
  );
  
  const snapshot = await getDocs(q);
  const apps = snapshot.docs.map(doc => doc.data() as App);
  return attachPublishers(apps);
};

export type SortOption = "newest" | "most_viewed" | "most_liked";

export interface GetAllAppsResult {
  apps: AppWithPublisher[];
  hasMore: boolean;
  total: number; // Note: In strict Firestore without aggregation, we return an estimate or just omit
}

/**
 * Get all apps with filtering, sorting, and cursor pagination
 * (For the sake of standard offset logic requested by "page", we fetch up to page * limit 
 * and slice. In a massive scale app, startAfter is better, but since "page" number is explicitly requested,
 * we will use a fetch-and-slice approach for the required page, or if Firestore limits are a concern, 
 * we use the new offset() query constraint if available, but web SDK offset isn't strictly standard 
 * without backend. We'll fetch the needed docs and slice.)
 */
export const getAllApps = async (
  category: string | null,
  sort: SortOption,
  page: number
): Promise<{ apps: AppWithPublisher[], hasMore: boolean }> => {
  const PAGE_SIZE = 12;
  const constraints: QueryConstraint[] = [
    where("status", "==", "published")
  ];

  if (category && category !== "All") {
    constraints.push(where("category", "==", category));
  }

  // Add sorting
  switch (sort) {
    case "newest":
      constraints.push(orderBy("createdAt", "desc"));
      break;
    case "most_viewed":
      constraints.push(orderBy("views", "desc"));
      break;
    case "most_liked":
      constraints.push(orderBy("likes", "desc"));
      break;
  }

  // We fetch (page * PAGE_SIZE) + 1 to know if there's a next page.
  // This is a naive offset approach suitable for small-medium datasets.
  const limitCount = (page * PAGE_SIZE) + 1;
  constraints.push(limit(limitCount));

  const q = query(collection(db, "apps"), ...constraints);
  const snapshot = await getDocs(q);
  
  const allFetched = snapshot.docs.map(doc => doc.data() as App);
  
  // Calculate if there's more and slice the current page
  const hasMore = allFetched.length > page * PAGE_SIZE;
  
  // Slice to get only the current page's data
  const startIndex = (page - 1) * PAGE_SIZE;
  const pageApps = allFetched.slice(startIndex, startIndex + PAGE_SIZE);

  const appsWithPublishers = await attachPublishers(pageApps);

  return {
    apps: appsWithPublishers,
    hasMore
  };
};
