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
  Query
} from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}
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
    return this.transformToUserTelegramResponseDto(user);
  }

  // Fetch all users
  @Get()
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userService.getAllUsers();
    return users.map(this.transformToUserResponseDto);
  }

  @Get('referral/:id')
  async getReferralLink(@Param('id') id: number): Promise<string> {
    const user = await this.userService.getUserById(id);
    return `https://t.me/moll_moll_bot?start=${user.referralCode}`;
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

  @Get('filter/:userId')
  async getFilteredMatches(
    @Param('userId') userId: number,
    @Query('ageRange') ageRange: string, // Example: "18,25"
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('languages') languages?: string, // Example: "English,Spanish"
    @Query('page') page = '1', // Default to page 1
    @Query('limit') limit = '10', // Default to 10 items per page
  ): Promise<{ users: UserResponseDto[], total: number, page: number, limit: number }> {
    // Parse query parameters
    const ageRangeParsed = ageRange ? ageRange.split(',').map(Number) as [number, number] : undefined;
    const languagesParsed = languages ? languages.split(',') : undefined;
    const pageParsed = parseInt(page, 10);
    const limitParsed = parseInt(limit, 10);
  
    // Pass parsed filters and pagination to the service
    const { users, total } = await this.userService.getAvailableUsersForLike(userId, {
      ageRange: ageRangeParsed,
      city,
      country,
      languages: languagesParsed,
    }, {
      page: pageParsed,
      limit: limitParsed,
    });
  
    return {
      users: users.map(this.transformToUserResponseDto),
      total,
      page: pageParsed,
      limit: limitParsed,
    };
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
    return this.transformToUserTelegramResponseDto(user);
  }


  @Get('explore/basic/:userId')
  async exploreFilteredUsersBasic(
    @Param('userId') userId: number,
    @Query('ageRange') ageRange: string, // Example: "18,25"
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('languages') languages?: string, // Example: "English,Spanish"
    @Query('genderFilter') genderFilter: 'female' | 'male' | 'all' = 'all', // Default to 'all'
    @Query('page') page = '1', // Default to page 1
    @Query('limit') limit = '10', // Default to 10 items per page
  ): Promise<{ users: { id: number, verifiedAccount: boolean, firstName: string, age: number, photo: string | null }[], total: number, page: number, limit: number }> {
    // Parse query parameters
    const ageRangeParsed = ageRange ? ageRange.split(',').map(Number) as [number, number] : undefined;
    const languagesParsed = languages ? languages.split(',') : undefined;
    const pageParsed = parseInt(page, 10);
    const limitParsed = parseInt(limit, 10);

    // Pass parsed filters and pagination to the service
    const { users, total } = await this.userService.getExploreUsersBasic(userId, {
      ageRange: ageRangeParsed,
      city,
      country,
      languages: languagesParsed,
      genderFilter, // Pass the gender filter
    }, {
      page: pageParsed,
      limit: limitParsed,
    });

    return {
      users: users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        age: user.age,
        verifiedAccount: user.verifiedAccount,
        photo: user.photos[0]?.smallUrl || null, // Assuming the first photo is the main one
      })),
      total,
      page: pageParsed,
      limit: limitParsed,
    };
  }

  @Post('apply-referral-reward/:referralCode')
  async applyReferralReward(@Param('referralCode') referralCode: string): Promise<string> {
    // Find the user by referral code
    const newUser = await this.userService.findOneByReferralCode(referralCode);
    if (!newUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Apply referral reward for the user who has this referral code
    await this.userService.applyReferralReward(newUser);

    // Return a success message
    return 'Referral reward applied successfully';
  }
  
  @Post('increase-reward')
  async increaseReferralReward(
    @Body('referrerId') referrerId: number,
    @Body('amount') amount: number,
  ): Promise<void> {
    await this.userService.increaseReferralReward(referrerId, amount);
  }

  @Post('decrease-reward')
  async decreaseReferralReward(
    @Body('referrerId') referrerId: number,
    @Body('amount') amount: number,
  ): Promise<void> {
    await this.userService.decreaseReferralReward(referrerId, amount);
  }


  // Helper function to transform User entity to UserResponseDto
  private transformToUserResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      city: user.city,
      profileData: {
        lookingFor: user.lookingFor,
        education: user.education,
        work: user.work,
        bio: user.bio,
      },
      moreAboutMe: {
        languages: user.languages,
        height: user.height,
        relationStatus: user.relationStatus,
        sexuality: user.sexuality,
        kids: user.kids,
        smoking: user.smoking,
        drink: user.drink,
        pets: user.pets
      },
      country: user.country,
      interests: user.interests,
      premium: user.premium,
      activityScore: user.activityScore,
      gender: user.gender,
      profileViewsIds:user.profileViews,
      giftUsers:user.giftUsers,
      lastActive: user.lastActive,
      verifiedAccount: user.verifiedAccount,
      photos: user.photos ? user.photos.map(photo => ({
        id: photo.id,
        small: photo.smallUrl,
        large: photo.largeUrl,
        order: photo.order,
      })) : [], 
      age: user.age,
      languagePreferences: user.languagePreferences, // Add language preferences
      isDeleted: user.isDeleted,                     // Add soft delete flag
      language: user.language,                       // Add language
      lat:user.lat,
      lon:user.lon,
      referralCode: user.referralCode,
      rewardPoints: user.rewardPoints
      
    };
  }  

  private async transformToUserTelegramResponseDto(user: User): Promise<UserResponseDto> {

    const favoriteUsersList = await Promise.all(
      (user.favoriteUsers ?? []).map(userId => this.userService.getUserSummary(userId)) // Check for null/undefined
    );
    
    const profileViewsList = await Promise.all(
      (user.profileViews ?? []).map(userId => this.userService.getUserSummary(userId)) // Check for null/undefined
    );
  
    const profileBlockedUserList = await Promise.all(
      (user.blockedUsers ?? []).map(userId => this.userService.getUserSummary(userId)) // Check for null/undefined
    );

    const profilegiftUsersList = await Promise.all(
      (user.giftUsers ?? []).map(userId => this.userService.getUserSummary(userId)) // Check for null/undefined
    );

    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      city: user.city,
      profileData: {
        lookingFor: user.lookingFor,
        education: user.education,
        work: user.work,
        bio: user.bio,
      },
      moreAboutMe: {
        languages: user.languages,
        height: user.height,
        relationStatus: user.relationStatus,
        sexuality: user.sexuality,
        kids: user.kids,
        smoking: user.smoking,
        drink: user.drink,
        pets: user.pets
      },
      country: user.country,
      interests: user.interests,
      premium: user.premium,
      activityScore: user.activityScore,
      gender: user.gender,
      profileViews: profileViewsList, // Updated
      favoriteUsers:favoriteUsersList, // Updated
      giftUsers:profilegiftUsersList,
      lastActive: user.lastActive,
      verifiedAccount: user.verifiedAccount,
      photos: user.photos ? user.photos.map(photo => ({
        id: photo.id,
        largeUrl: photo.largeUrl,
        order: photo.order,
      })) : [], 
      blockedUsers: profileBlockedUserList,
      age: user.age,
      languagePreferences: user.languagePreferences,
      isDeleted: user.isDeleted,
      language: user.language,
      lat: user.lat,
      lon: user.lon,
      referralCode: user.referralCode,
      rewardPoints: user.rewardPoints


    };
  }
  
}
