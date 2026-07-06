import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { TrackPageViewDto } from './dto/track-pageview.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Request } from 'express';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Post('track')
  track(@Body() dto: TrackPageViewDto, @Req() req: Request) {
    return this.analyticsService.track(dto, req);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getStats(@Query('days') days: number) {
    return this.analyticsService.getStats(days);
  }

  @Get('referrers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getTopReferrers(@Query('days') days: number) {
    return this.analyticsService.getTopReferrers(days);
  }
}
