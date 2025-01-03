import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Like } from '../like/like.entity';
import { Match } from '../match/match.entity';
import { Message } from '../message/entities/message.entity';
import { Photo } from '../photo/photo.entity';  // Import the Photo entity

@Entity('users')
export class User {
  @OneToMany(() => Like, like => like.user, { cascade: true })
  sentLikes: Like[];

  @OneToMany(() => Like, like => like.likedUser, { cascade: true })
  receivedLikes: Like[];

  @OneToMany(() => Match, match => match.user, { cascade: true })
  matches: Match[];

  @OneToMany(() => Match, match => match.likedUser, { cascade: true })
  likedMatches: Match[];

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  telegramId: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  country?: string;

  @Column('text', { array: true, nullable: true, default: []  })
  languages?: string[];

  @Column('simple-array', { nullable: true, default: []  })
  interests?: string[];

  @Column({ nullable: true })
  height?: number;

  @Column({ default: false })
  premium: boolean;

  @Column({ nullable: true })
  activityScore?: number;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true })
  lookingFor?: string;

  @Column({ nullable: true })
  relationStatus?: string;

  @Column({ nullable: true })
  sexuality?: string;

  @Column({ nullable: true })
  education?: string;

  @Column({ nullable: true })
  work?: string;

  @Column('simple-array', { nullable: true, default: [] })
  hobbies?: string[];

  @Column({ default: 0 })
  profileViews: number;

  @Column({ nullable: true })
  lastActive?: Date;

  @Column({ nullable: true })
  bio?: string;

  @Column({ default: false })
  verifiedAccount: boolean;

  @Column('int', { array: true, nullable: true, default: []  })
  blockedUsers: number[];// List of blocked user IDs

  @Column('simple-array', { default: [] })
  reportedUsers: number[];  // List of reported user IDs

  @Column('simple-array', { nullable: true, default: []  })
  favoriteUsers?: number[];

  @Column({ default: false })
  isDeleted: boolean;  // Soft delete flag

  @Column({ default: 'en' })
  language: string;

  @Column('decimal', { precision: 10, scale: 6,nullable:true })
  lat?: number;

  @Column('decimal', { precision: 10, scale: 6, nullable:true })
  lon?: number;
  
    // Matches as user1


    @Column({ nullable: true })
    age: number; // New field for age

    @Column('simple-array', { nullable: true })
    languagePreferences: string[]; // New field for language preferences
    
    @OneToMany(() => Message, (message) => message.sender, { onDelete: 'CASCADE' })
    sentMessages: Message[];
    
    @OneToMany(() => Message, (message) => message.recipient, { onDelete: 'CASCADE' })
    receivedMessages: Message[];

    @OneToMany(() => Photo, (photo) => photo.user, { eager: true })
    photos: Photo[];
    
}

