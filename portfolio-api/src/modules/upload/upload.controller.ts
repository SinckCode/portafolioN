import { Controller, Post, Delete, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('upload')
@ApiBearerAuth()
@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @Roles('admin', 'editor')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.saveFile(file);
  }

  // Avatar: cualquier usuario autenticado; guarda y actualiza su perfil en un paso
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadAvatar(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    return this.uploadService.saveAvatar(file, user._id);
  }

  @Delete(':filename')
  @Roles('admin')
  remove(@Param('filename') filename: string) {
    return this.uploadService.deleteFile(filename);
  }
}
