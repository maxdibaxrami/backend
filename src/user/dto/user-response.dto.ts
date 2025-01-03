
export class UserResponseDto {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  languages?: string[];
  interests?: string[];
  height?: number;
  premium: boolean;
  activityScore?: number;
  gender?: string;
  lookingFor?: string;
  relationStatus?: string;
  sexuality?: string;
  education?: string;
  work?: string;
  hobbies?: string[];
  profileViews: number;
  lastActive?: Date;
  bio?: string;
  verifiedAccount: boolean;
  photos?: { id: number, url: string, order: number }[];  // Include photos
  blockedUsers?: number[];
  favoriteUsers?: number[];
  age: number;
  lat?: number;
  lon?: number;
  // New fields based on updated entity
  languagePreferences?: string[];  // User's language preferences
  reportedUsers?: number[];        // List of reported users' IDs
  isDeleted?: boolean;             // Soft delete flag
  language?: string;               // User's preferred language
}
