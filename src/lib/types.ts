export interface SoftUser {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  password?: string; // For custom login verification
  status: "Active" | "Inactive";
  enrolledAt: number;
  createdAt: number;
  deadline: number;
}

export interface Lead {
  [key: string]: any;
}

export type ViewType = "dashboard" | "usa-leads" | "bengali-leads" | "profile";
