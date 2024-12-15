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
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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


  @Delete(':id')
  async deleteUser(
    @Param('id') id: number, 
  ): Promise<string> {
    const user = await this.userService.deleteUser(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return "user deleted";
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

  @Get('telegram/:telegramid')
  async getUserByTelegramId(@Param('telegramid') telegramid: string): Promise<UserResponseDto> {
    const user = await this.userService.findByTelegramId(telegramid);
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

  // Upload profile picture and add to user's photos array
  @Post('upload/:id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/profile-pictures', // Path to save images
      filename: (req, file, callback) => {
        const fileExtName = path.extname(file.originalname); // Extract file extension
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`; // Generate a unique filename with extension
        callback(null, fileName); // Save the file with the unique name
      }
    }),
  }))
  async uploadProfilePicture(
    @Param('id') id: number, 
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new HttpException('File not provided', HttpStatus.BAD_REQUEST); // Handle file not provided error
    }

    // Fetch user by ID
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND); // Handle user not found error
    }

    // Ensure user photos array exists
    if (!user.photos) {
      user.photos = [];
    }

    // Save the file path in the user's photos array
    const filePath = `/uploads/profile-pictures/${file.filename}`;
    user.photos.push(filePath);

    // Update the user's photos in the database
    await this.userService.updateUserPhotos(user);

    return {
      message: 'Image uploaded successfully',
      photos: user.photos, // Return updated photos
    };
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
