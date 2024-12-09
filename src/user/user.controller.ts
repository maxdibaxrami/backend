import { 
  Controller, 
  Post, 
  Body, 
  Param, 
  Put, 
  Get, 
  Patch, 
  Delete, 
  HttpException, 
  HttpStatus , 
  UseInterceptors, 
  UploadedFile
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { fileFilter, storage } from './file-upload.utils';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('upload/:id')
  @UseInterceptors(FileInterceptor('file', { storage, fileFilter }))
  async uploadProfilePicture(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
    return this.userService.updateUserProfilePicture(id, file.filename);
  }

  // Create a new user profile
  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.createUser(createUserDto);
    return this.transformToUserResponseDto(user);
  }

  // Update an existing user profile
  @Put(':id')
  async updateUser(
    @Param('id') id: number, 
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateUser(id, updateUserDto);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.transformToUserResponseDto(user);
  }

  // Fetch user profile by ID
  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<UserResponseDto> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.transformToUserResponseDto(user);
  }

  // Fetch all users
  @Get()
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userService.getAllUsers();
    return users.map(this.transformToUserResponseDto);
  }

  // Delete a user
  @Post('delete/:id')
  async softDelete(@Param('id') id: number) {
    return this.userService.softDeleteUser(id);
  }

  @Post('block/:id')
  async blockUser(@Param('id') id: number, @Body('blockedUserId') blockedUserId: number) {
    return this.userService.blockUser(id, blockedUserId);
  }

  @Post('report/:id')
  async reportUser(@Param('id') id: number, @Body('reportedUserId') reportedUserId: number) {
    return this.userService.reportUser(id, reportedUserId);
  }

  @Post('premium/:id')
  async togglePremiumStatus(@Param('id') id: number, @Body('premium') premium: boolean) {
    return this.userService.setPremiumStatus(id, premium);
  }

  @Post('language/:id')
  async setLanguage(@Param('id') id: number, @Body('language') language: string) {
    return this.userService.setUserLanguage(id, language);
  }

  // Patch a user profile (update specific fields)
  @Patch(':id')
  async patchUser(
    @Param('id') id: number, 
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.patchUser(id, updateUserDto);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.transformToUserResponseDto(user);
  }

  // Helper function to transform User entity to UserResponseDto
  private transformToUserResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      photoUrl: user.photoUrl,
      city: user.city,
      country: user.country,
      languages: user.languages,
      interests: user.interests,
      height: user.height,
      premium: user.premium,
      activityScore: user.activityScore,
      gender: user.gender,
      lookingFor: user.lookingFor,
      relationStatus: user.relationStatus,
      sexuality: user.sexuality,
      education: user.education,
      work: user.work,
      hobbies: user.hobbies,
      profileViews: user.profileViews,
      lastActive: user.lastActive,
      bio: user.bio,
      verifiedAccount: user.verifiedAccount,
      photos: user.photos,
      blockedUsers: user.blockedUsers,
      favoriteUsers: user.favoriteUsers,
      age: user.age,
      languagePreferences: user.languagePreferences, // Add language preferences
      reportedUsers: user.reportedUsers,             // Add reported users
      isDeleted: user.isDeleted,                     // Add soft delete flag
      language: user.language,                       // Add language
    };
  }  
}
