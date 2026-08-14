import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { UploadService } from './upload.service';

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

// Mock UsersService module to avoid transitive bcrypt import
jest.mock('../users/users.service', () => ({
  UsersService: jest.fn().mockImplementation(() => ({ update: jest.fn() })),
}));

describe('UploadService.deleteFile', () => {
  let service: UploadService;

  beforeEach(() => {
    jest.clearAllMocks();
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    // Construct with mocked UsersService
    service = new UploadService({ update: jest.fn() } as any);
  });

  it('should delete a valid filename', async () => {
    await service.deleteFile('abc-123.jpg');
    expect(fs.unlinkSync).toHaveBeenCalled();
  });

  it('should reject path traversal with ../', async () => {
    await expect(service.deleteFile('../../../etc/passwd')).rejects.toThrow(
      BadRequestException,
    );
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  it('should reject path traversal with backslashes', async () => {
    await expect(service.deleteFile('..\\..\\etc\\passwd')).rejects.toThrow(
      BadRequestException,
    );
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  it('should reject filenames with directory separators', async () => {
    await expect(service.deleteFile('subdir/file.jpg')).rejects.toThrow(
      BadRequestException,
    );
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  it('should not throw if file does not exist', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    await expect(service.deleteFile('nonexistent.jpg')).resolves.toBeUndefined();
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });
});
