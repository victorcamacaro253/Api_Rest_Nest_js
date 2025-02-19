import { Controller, Get, Post, Body,Patch, Query,Put,Param, UseInterceptors,Res, UploadedFile,InternalServerErrorException,UploadedFiles,BadRequestException, UseGuards  } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FileUploadInterceptor } from '../common/file-upload.interceptor'; // Import the custom interceptor
import { AuthGuard } from 'src/authentication/guards/auth.guard';
import { ExportService } from 'src/export/export.service';
import { Response } from 'express';


@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService,  
    private readonly exportService: ExportService
  ) {}

  
  @Post()
  @UseInterceptors(FileUploadInterceptor.upload())
  async create(@Body() createUserDto: CreateUserDto, @UploadedFile() file: Express.Multer.File) {
   // console.log('Incoming request data:', createUserDto);
   // console.log('Uploaded files:', file);
    const imagePath = file  ? `/uploads/${file.filename}` : '';
  //  console.log('Image path:', imagePath);
    // Create user data including the image path
    const userData = { ...createUserDto, imagePath };
   // console.log('User  data before saving:', userData);
    
    try {
        const createdUser  = await this.userService.create(userData);
        console.log('Created user:', createdUser );
        return createdUser ;
    } catch (error) {
        console.error('Error saving user:', error);
        throw new InternalServerErrorException('Failed to create user');
    }
}

/*
@Post('multiple')
@UseInterceptors(FileUploadInterceptor.uploadMultiple()) // Multiple file upload
async createMultipleUsers(
  @Body() createUsersDto: CreateUserDto[], // Array of user objects
  @UploadedFiles() files: Express.Multer.File[] // Multiple files
) {
  console.log('Incoming users data:', createUsersDto);
  console.log('Uploaded files:', files);

  // Attach image paths to corresponding users
  const usersWithImages = createUsersDto.map((user, index) => ({
    ...user,
    imagePath: files[index] ? `/uploads/${files[index].filename}` : '', // Assign file if available
  }));

  console.log('Users data before saving:', usersWithImages);

  try {
    const createdUsers = await this.userService.createMultiple(usersWithImages);
    console.log('Created users:', createdUsers);
    return createdUsers;
  } catch (error) {
    console.error('Error saving users:', error);
    throw new InternalServerErrorException('Failed to create multiple users');
  }
} */

  @Post('multiple')
@UseInterceptors(FileUploadInterceptor.uploadMultiple()) // Multiple file upload
async createMultipleUsers(
  @Body() createUsersDto: CreateUserDto[], 
  @UploadedFiles() files: Express.Multer.File[]
) {
  console.log('Incoming users data:', createUsersDto);
  console.log('Uploaded files:', files);

  // Assign images to users (each user gets one image)
  const usersWithImages = createUsersDto.map((user, index) => ({
    ...user,
    imagePath: files[index] ? `/uploads/${files[index].filename}` : '',
  }));

  try {
    const createdUsers = await this.userService.createMultiple(usersWithImages);
    console.log('Created users:', createdUsers);
    return createdUsers;
  } catch (error) {
    console.error('Error saving users:', error);
    throw new InternalServerErrorException('Failed to create multiple users');
  }
}


  @Get()
  @UseGuards(AuthGuard)  // Protect all routes in this controller

  findAll() {
    return this.userService.findAll();
  }

  @Get('personal-id/:personal_ID')
  async getUserByPersonalId(@Param('personal_ID')personal_ID:string){
    return this.userService.findByPersonalId(personal_ID);

  }

  @Get('paginate')
  async getUsersWithPagination(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    return this.userService.getUsersWithPagination(pageNumber, limitNumber);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

 @Get('username/:username')
 findByUsername(@Param('username') username: string) {
  return this.userService.findByUsername(username);
  }

 
  @Put(':id')
  @UseInterceptors(FileUploadInterceptor.upload())
  async update(@Param('id') id: string, @Body() updateUserDto: CreateUserDto, @UploadedFile() files: Express.Multer.File[]) {
    const imagePath = files && files.length > 0 ? `/uploads/${files[0].filename}` : '';
    return this.userService.update(+id, { ...updateUserDto, imagePath });
  }



  @Patch(':id/status/:status') // Example: PATCH /users/1/status/on
  async changeStatus(
    @Param('id') id: string,
    @Param('status') status: string
  ) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.userService.changeStatus(userId, status);
  }


  
  @Get('export/:format')
  async exportUsers(
    @Param('format') format: string,
    @Res() res: Response
  ) {
    const users = await this.userService.findAll();
    const headers = ['user_id', 'fullname', 'username', 'email', 'personal_ID', 'phone', 'status'];
    const formattedData = this.exportService.formatDataForExport(users, format);

    switch (format.toLowerCase()) {
      case 'excel':
        const excelBuffer = await this.exportService.exportToExcel(formattedData);
        res.set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename=users.xlsx'
        });
        return res.send(excelBuffer);

      case 'pdf':
        const pdfBuffer = await this.exportService.exportToPDF(
          formattedData,
          headers,
          'Users Report'
        );
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=users.pdf'
        });
        return res.send(pdfBuffer);

      case 'csv':
        const csv = await this.exportService.exportToCSV(formattedData, headers);
        res.set({
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=users.csv'
        });
        return res.send(csv);

      default:
        throw new BadRequestException('Unsupported format. Use excel, pdf, or csv');
    }
  }

  @Get('export/:userId/:format')
  async exportUserData(
    @Param('userId') userId: number,
    @Param('format') format: string,
    @Res() res: Response
  ) {
    const user = await this.userService.findOne(userId);
    const headers = ['user_id', 'fullname', 'username', 'email', 'personal_ID', 'phone', 'status'];
    const formattedData = this.exportService.formatDataForExport([user], format);
  
    switch (format.toLowerCase()) {
      case 'excel':
        const excelBuffer = await this.exportService.exportToExcel(formattedData);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=user_${userId}.xlsx`);
        res.send(excelBuffer);
        break;
  
      case 'pdf':
        const pdfBuffer = await this.exportService.exportToPDF(
          formattedData,
          headers,
          `User ${userId} Report`
        );
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=user_${userId}.pdf`);
        res.send(pdfBuffer);
        break;
  
      case 'csv':
        const csv = await this.exportService.exportToCSV(formattedData, headers);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=user_${userId}.csv`);
        res.send(csv);
        break;
  
      default:
        throw new BadRequestException('Unsupported format. Use excel, pdf, or csv');
    }
  }
  

}