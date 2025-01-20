import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  largeUrl: string;  // Path to the large photo file

  @Column()
  smallUrl: string;  // Path to the small photo file

  @Column()
  order: number;  // Order of the photo (1-6)

  @ManyToOne(() => User, (user) => user.photos, { onDelete: 'CASCADE' })
  user: User;  // Reference to the user owning the photo
}
