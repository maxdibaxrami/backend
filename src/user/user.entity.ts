import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Like } from '../like/like.entity';
import { Match } from '../match/match.entity';
import { Message } from '../message/entities/message.entity';
import { Photo } from '../photo/photo.entity';  // Import the Photo entity
import { Notification } from '../notification/entities/notification/notification';

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

  @Column({ unique: true })
  telegramId: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  country?: string;

  @Column('text', { array: true, nullable: true, default: [] })
  languages?: string[];

  @Column('int', { array: true, nullable: true, default: [] })
  interests?: number[];

  @Column({ nullable: true })
  height?: number;

  @Column({ default: false })
  premium: boolean;

  @Column({ nullable: true, default: 0 })
  activityScore?: number;

  @Column({ nullable: false })
  gender: string;

  @Column({ nullable: false , default: "1" })
  lookingFor: string;

  @Column({ nullable: false })
  relationStatus: string;

  @Column({ nullable: false, default: "1" })
  sexuality: string;

  @Column({ nullable: true })
  education?: string;

  @Column({ nullable: true })
  work?: string;

  @Column('int', { array: true, nullable: true, default: [] })
  profileViews: number[];

  @Column({ nullable: true })
  lastActive?: Date;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: false, default: "6" })
  kids: string;

  @Column({ nullable: false, default: "5" })
  smoking: string;

  @Column({ nullable: false, default: "5" })
  drink: string;

  @Column({ nullable: false, default: "5" })
  pets: string;

  @Column({ default: false })
  verifiedAccount: boolean;

  @Column('int', { array: true, nullable: true, default: [] })
  blockedUsers: number[];

  @Column('int', { array: true, nullable: true, default: [] })
  reportedUsers: number[];

  @Column('int', { array: true, nullable: true, default: [] })
  favoriteUsers?: number[];

  @Column('int', { array: true, nullable: true, default: [] })
  giftUsers?: number[];

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: 'en' })
  language: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  lat?: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  lon?: number;

  @Column({ nullable: true })
  age?: number;

  @Column('simple-array', { nullable: true })
  languagePreferences: string[];

  @OneToMany(() => Message, (message) => message.sender, { onDelete: 'CASCADE' })
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.recipient, { onDelete: 'CASCADE' })
  receivedMessages: Message[];

  @OneToMany(() => Photo, (photo) => photo.user, { eager: true })
  photos: Photo[];

  @Column({ unique: true })
  referralCode: string;

  @ManyToOne(() => User, user => user.referredUsers)
  referrer: User;

  @OneToMany(() => User, user => user.referrer)
  referredUsers: User[];

  @Column({ default: 40 })
  rewardPoints: number;
  
  @Column()
  createdAt: Date;

  @OneToMany(() => Notification, (notification) => notification.user, { cascade: true })
  notifications: Notification[];

}


