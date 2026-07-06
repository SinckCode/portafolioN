import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SiteConfig } from './schemas/site-config.schema';
import { UpdateSiteConfigDto } from './dto/update-site-config.dto';

@Injectable()
export class SiteConfigService {
  constructor(@InjectModel(SiteConfig.name) private configModel: Model<SiteConfig>) {}

  async get() {
    let config = await this.configModel.findOne({ key: 'main' });
    if (!config) {
      config = await this.configModel.create({ key: 'main', siteName: 'Angel Onesto Portfolio' });
    }
    return config;
  }

  async update(dto: UpdateSiteConfigDto) {
    return this.configModel.findOneAndUpdate(
      { key: 'main' },
      { $set: dto },
      { new: true, upsert: true },
    );
  }
}
