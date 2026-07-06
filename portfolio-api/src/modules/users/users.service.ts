import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { password, ...rest } = createUserDto;
    const passwordHash = await bcrypt.hash(password, 12);
    const user = new this.userModel({ ...rest, passwordHash });
    return user.save();
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit, sort } = paginationDto;
    const skip = (page - 1) * limit;

    const sortObj: Record<string, 1 | -1> = {};
    if (sort) {
      const direction = sort.startsWith('-') ? -1 : 1;
      const field = sort.replace(/^-/, '');
      sortObj[field] = direction;
    } else {
      sortObj['createdAt'] = -1;
    }

    const [data, total] = await Promise.all([
      this.userModel.find().sort(sortObj).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: updateUserDto }, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async setRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const hashed = refreshToken ? await bcrypt.hash(refreshToken, 12) : null;
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashed }).exec();
  }

  async setResetPasswordToken(userId: string, token: string, expires: Date): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      })
      .exec();
  }

  async findByResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      })
      .exec();
  }

  async updatePassword(userId: string, password: string): Promise<void> {
    const passwordHash = await bcrypt.hash(password, 12);
    await this.userModel
      .findByIdAndUpdate(userId, {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      })
      .exec();
  }

  async setVerificationToken(userId: string, token: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { verificationToken: token }).exec();
  }

  async verifyEmail(token: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ verificationToken: token }).exec();
    if (!user) return null;
    user.isVerified = true;
    user.verificationToken = null;
    return user.save();
  }
}
