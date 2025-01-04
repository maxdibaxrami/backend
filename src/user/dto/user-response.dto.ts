
export class UserResponseDto {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  interests?: string[];
  premium: boolean;
  activityScore?: number;
  gender?: string;
  profileData?:{
    lookingFor?: string;
    education?: string;
    work?: string;
    bio?: string;
  }
  moreAboutMe?:{
    relationStatus?: string;
    sexuality?: string;
    languages?: string[];
    height?: number;
    kids: string;
    smoking: string;
    drink: string;
    pets: string;
  }
  hobbies?: string[];
  profileViews: string[];
  lastActive?: Date;
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
