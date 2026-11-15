import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  AccountStatus,
  PlatformRole,
  VerificationStatus,
} from '../enums/user.enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  fullName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 30, unique: true, nullable: true })
  phoneNumber: string | null;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

  @Column({
    name: 'account_status',
    type: 'varchar',
    length: 20,
    default: AccountStatus.ACTIVE,
  })
  accountStatus: AccountStatus;

  @Column({
    name: 'verification_status',
    type: 'varchar',
    length: 20,
    default: VerificationStatus.UNVERIFIED,
  })
  verificationStatus: VerificationStatus;

  @Column({
    name: 'platform_role',
    type: 'varchar',
    length: 30,
    default: PlatformRole.USER,
  })
  platformRole: PlatformRole;

  @Column({ name: 'email_verification_code', type: 'varchar', length: 10, nullable: true })
  emailVerificationCode: string | null;

  @Column({
    name: 'email_verification_expires_at',
    type: 'timestamptz',
    nullable: true,
  })
  emailVerificationExpiresAt: Date | null;

  @Column({ name: 'mfa_enabled', type: 'boolean', default: false })
  mfaEnabled: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
