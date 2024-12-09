import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sentLikes, { eager: true })
  user: User;

  @ManyToOne(() => User, (user) => user.receivedLikes, { eager: true })
  likedUser: User;

  @Column({ default: false })
  isLiked: boolean;
}
