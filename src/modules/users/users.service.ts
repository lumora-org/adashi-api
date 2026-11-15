import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
    }
    return user;
  }

  async updateProfile(
    userId: string,
    patch: { fullName?: string; phoneNumber?: string },
  ): Promise<User> {
    const user = await this.getProfile(userId);
    if (patch.fullName !== undefined) user.fullName = patch.fullName;
    if (patch.phoneNumber !== undefined) user.phoneNumber = patch.phoneNumber;
    return this.usersRepository.save(user);
  }

  toProfileDto(user: User): Record<string, unknown> {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      accountStatus: user.accountStatus,
      verificationStatus: user.verificationStatus,
      platformRole: user.platformRole,
      createdAt: user.createdAt,
    };
  }
}
