export class UserResponseDto {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
  city?: string;
  profileData: {
    lookingFor: string;
    education?: string;
    work?: string;
    bio?: string;
  };
  moreAboutMe: {
    languages?: string[];
    height?: number;
    relationStatus: string;
    sexuality: string;
    kids: string;
    smoking: string;
    drink: string;
    pets: string;
  };
  country?: string;
  interests?: number[];
  premium: boolean;
  activityScore?: number;
  gender: string;
  profileViews?: { id: number; firstName: string; age?: number; imageUrl?: string }[]; // Updated
  favoriteUsers?: { id: number; firstName: string; age?: number; imageUrl?: string }[]; // Updated
  lastActive?: Date;
  verifiedAccount: boolean;
  photos?: { id: number; small?: string; large?: string; order: number }[];
  blockedUsers?: { id: number; firstName: string; age?: number; imageUrl?: string }[];
  favoriteUsersList?: { id: number; firstName: string; age?: number; imageUrl?: string }[]; // New field
  profileViewsList?: { id: number; firstName: string; age?: number; imageUrl?: string }[];  // New field
  age?: number;
  languagePreferences?: string[];
  isDeleted: boolean;
  language: string;
  lat?: number;
  lon?: number;
  referralCode?:string;
  rewardPoints?:number;
  profileViewsIds?:number[]
  giftUsers?: { id: number; firstName: string; age?: number; imageUrl?: string }[] | number[];
}
