import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sentLikes, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => User, (user) => user.receivedLikes, { eager: true, onDelete: 'CASCADE' })
  likedUser: User;

  @Column({ default: false })
  isLiked: boolean;
}
