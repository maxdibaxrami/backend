import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;  // Path to the photo file

  @Column()
  order: number;  // Order of the photo (1-6)

  @ManyToOne(() => User, (user) => user.photos, { onDelete: 'CASCADE' })
  user: User;  // Reference to the user owning the photo
}
