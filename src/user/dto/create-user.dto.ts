import { IsString, IsArray, IsOptional, IsBoolean, IsInt, IsNumber, IsDate } from 'class-validator';
import { Photo } from 'src/photo/photo.entity';

export class CreateUserDto {
  @IsString()
  telegramId: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsArray()
  @IsNumber()
  interests?: number[];

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsBoolean()
  premium?: boolean;

  @IsNumber()
  @IsOptional()
  activityScore: number;

  @IsString()
  @IsOptional()
  gender: string;

  @IsOptional()
  lookingFor: string;

  @IsString()
  @IsOptional()
  relationStatus: string;

  @IsString()
  @IsOptional()
  sexuality: string;

  @IsString()
  @IsOptional()
  education: string;

  @IsString()
  @IsOptional()
  work: string;
  

  @IsDate()
  @IsOptional()
  lastActive: Date;

  @IsString()
  @IsOptional()
  bio: string;

  @IsBoolean()
  @IsOptional()
  verifiedAccount: boolean;

  @IsArray()
  @IsOptional()
  photos: Photo[];

  @IsArray()
  @IsOptional()
  blockedUsers: number[];

  @IsArray()
  @IsOptional()
  favoriteUsers: number[];

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lon?: number;
}

