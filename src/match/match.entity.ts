// match.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.matches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, (user) => user.likedMatches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'liked_user_id' })
  likedUser: User;

  @Column()
  matchedAt: Date;
}
