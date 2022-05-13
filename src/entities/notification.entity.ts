import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({
    default: false,
  })
  hasNotified: boolean;

  @Column()
  notifiedAt: Date;

  @Column({
    type: "varchar",
    nullable: true,
  })
  message: string | null;

  @Column({
    type: "varchar",
    nullable: true,
  })
  ipAddress: string | undefined;
}
