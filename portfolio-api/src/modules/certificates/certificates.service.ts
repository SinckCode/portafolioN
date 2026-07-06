import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { Certificate } from './schemas/certificate.schema';

@Injectable()
export class CertificatesService {
  constructor(@InjectModel(Certificate.name) private certModel: Model<Certificate>) {}

  async findById(id: string): Promise<Certificate> {
    const cert = await this.certModel
      .findById(id)
      .populate('user', 'name email')
      .populate('course', 'title slug');
    if (!cert) throw new NotFoundException('Certificado no encontrado');
    return cert;
  }

  async findByNumber(certificateNumber: string): Promise<Certificate> {
    const cert = await this.certModel
      .findOne({ certificateNumber })
      .populate('user', 'name email')
      .populate('course', 'title slug');
    if (!cert) throw new NotFoundException('Certificado no encontrado');
    return cert;
  }

  async generate(userId: string, courseId: string, enrollmentId: string): Promise<Certificate> {
    const certificateNumber = `AO-${Date.now().toString(36).toUpperCase()}-${uuid().split('-')[0].toUpperCase()}`;
    return this.certModel.create({
      user: userId,
      course: courseId,
      enrollment: enrollmentId,
      certificateNumber,
      verificationUrl: `https://angelonesto.com/certificado/${certificateNumber}`,
    });
  }
}
