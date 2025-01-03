import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  sender: User;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE'})
  recipient: User;

  @Column()
  content: string;

  @Column({ nullable: true })
  mediaUrl: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ nullable: true })
  readAt: Date;
}
