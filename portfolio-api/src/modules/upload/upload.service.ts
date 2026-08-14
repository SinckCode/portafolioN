import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { UsersService } from '../users/users.service';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private readonly usersService: UsersService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File) {
    const ext = path.extname(file.originalname);
    const filename = `${uuid()}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    const isImage = /\.(jpg|jpeg|png|webp)$/i.test(ext);

    if (isImage) {
      // Compatibilidad CJS/ESM: bajo ts-node el módulo ES la función misma
    const sharpModule: any = await import('sharp');
    const sharp = sharpModule.default ?? sharpModule;
      await sharp(file.buffer)
        .resize(1920, null, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(filepath);
    } else {
      fs.writeFileSync(filepath, file.buffer);
    }

    this.logger.log(`File saved: ${filename}`);
    return {
      url: `/uploads/${filename}`,
      filename,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  // Guarda el avatar (cuadrado 512px) y actualiza user.avatar
  async saveAvatar(file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }
    const ext = path.extname(file.originalname);
    if (!/\.(jpg|jpeg|png|webp)$/i.test(ext)) {
      throw new BadRequestException('El avatar debe ser una imagen (jpg, png o webp)');
    }

    const filename = `avatar-${uuid()}.jpg`;
    const filepath = path.join(this.uploadDir, filename);

    // Compatibilidad CJS/ESM: bajo ts-node el módulo ES la función misma
    const sharpModule: any = await import('sharp');
    const sharp = sharpModule.default ?? sharpModule;
    await sharp(file.buffer)
      .resize(512, 512, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(filepath);

    const url = `/uploads/${filename}`;
    await this.usersService.update(userId, { avatar: url } as any);

    this.logger.log(`Avatar saved for user ${userId}: ${filename}`);
    return { url };
  }

  async deleteFile(filename: string) {
    if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
      throw new BadRequestException('Invalid filename');
    }
    const sanitized = path.basename(filename);
    const filepath = path.join(this.uploadDir, sanitized);
    if (!path.resolve(filepath).startsWith(path.resolve(this.uploadDir))) {
      throw new BadRequestException('Invalid filename');
    }
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      this.logger.log(`File deleted: ${sanitized}`);
    }
  }
}
