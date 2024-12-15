import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Like } from '../like/like.entity';
import { Match } from '../match/match.entity';
import { Message } from '../message/entities/message.entity';

@Entity('users')
export class User {
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

  @Column('text', { array: true, nullable: true })
  languages?: string[];

  @Column('simple-array', { nullable: true })
  interests?: string[];

  @Column({ nullable: true })
  height?: number;

  @Column({ default: false })
  premium: boolean;

  @Column({ nullable: true })
  activityScore?: number;

  @Column({ nullable: true })
  gender?: string;

  @Column({ type: 'simple-array', nullable: true })
  lookingFor?: string[];

  @Column({ nullable: true })
  relationStatus?: string;

  @Column({ nullable: true })
  sexuality?: string;

  @Column({ nullable: true })
  education?: string;

  @Column({ nullable: true })
  work?: string;

  @Column('simple-array', { nullable: true })
  hobbies?: string[];

  @Column({ default: 0 })
  profileViews: number;

  @Column({ nullable: true })
  lastActive?: Date;

  @Column({ nullable: true })
  bio?: string;

  @Column({ default: false })
  verifiedAccount: boolean;

  @Column('simple-array', { nullable: true })
  photos?: string[];

  @Column('int', { array: true, nullable: true })
  blockedUsers: number[];// List of blocked user IDs

  @Column('simple-array', { default: [] })
  reportedUsers: number[];  // List of reported user IDs

  @Column('simple-array', { nullable: true })
  favoriteUsers?: number[];

  @Column({ default: false })
  isDeleted: boolean;  // Soft delete flag

  @Column({ default: 'en' })
  language: string;

    // Sent likes (user who likes)
    @OneToMany(() => Like, (like) => like.user)
    sentLikes: Like[];
  
    // Received likes (user who gets liked)
    @OneToMany(() => Like, (like) => like.likedUser)
    receivedLikes: Like[];
  
    // Matches as user1
    @OneToMany(() => Match, (match) => match.user)  // Correct reference to `user`
    matches: Match[];
  
    @OneToMany(() => Match, (match) => match.likedUser)  // Correct reference to `likedUser`
    likedMatches: Match[];

    @Column({ nullable: true })
    age: number; // New field for age

    @Column('simple-array', { nullable: true })
    languagePreferences: string[]; // New field for language preferences

    @OneToMany(() => Message, (message) => message.sender)
    sentMessages: Message[];

    @OneToMany(() => Message, (message) => message.recipient)
    receivedMessages: Message[];

    
}
