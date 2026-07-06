import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PageView } from './schemas/pageview.schema';
import { TrackPageViewDto } from './dto/track-pageview.dto';

@Injectable()
export class AnalyticsService {
  constructor(@InjectModel(PageView.name) private pageViewModel: Model<PageView>) {}

  async track(dto: TrackPageViewDto, req: any) {
    return this.pageViewModel.create({
      path: dto.path,
      referrer: dto.referrer,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });
  }

  async getStats(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalViews, uniquePaths, topPages, viewsByDay] = await Promise.all([
      this.pageViewModel.countDocuments({ viewedAt: { $gte: since } }),
      this.pageViewModel.distinct('path', { viewedAt: { $gte: since } }),
      this.pageViewModel.aggregate([
        { $match: { viewedAt: { $gte: since } } },
        { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      this.pageViewModel.aggregate([
        { $match: { viewedAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      totalViews,
      uniquePages: uniquePaths.length,
      topPages,
      viewsByDay,
    };
  }

  async getTopReferrers(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.pageViewModel.aggregate([
      { $match: { viewedAt: { $gte: since }, referrer: { $nin: [null, ''] } } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
  }
}
