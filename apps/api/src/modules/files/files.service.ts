import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

@Injectable()
export class FilesService {
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir =
      this.configService.get<string>('UPLOAD_DIR') ||
      path.join(process.cwd(), 'uploads');
    this.ensureUploadDir();
  }

  getUploadDir(): string {
    return this.uploadDir;
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    this.validateImage(file);

    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    await fs.promises.writeFile(filePath, file.buffer);

    return { url: `/uploads/${filename}` };
  }

  async uploadAvatar(
    file: Express.Multer.File,
    userId: number,
  ): Promise<{ url: string }> {
    this.validateImage(file);

    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `user-${userId}-avatar${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    // TODO: Add sharp for resizing to 200x200
    // For now, save the file as-is
    await fs.promises.writeFile(filePath, file.buffer);

    return { url: `/uploads/${filename}` };
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, path.basename(filePath));

    try {
      await fs.promises.access(fullPath);
    } catch {
      throw new NotFoundException('File not found');
    }

    await fs.promises.unlink(fullPath);
  }

  private validateImage(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
      );
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(
        `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
      );
    }
  }

  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }
}
