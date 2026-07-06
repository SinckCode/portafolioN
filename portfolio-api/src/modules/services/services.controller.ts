import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'status', required: false, description: "active | hidden | all (admin)" })
  findAll(@Query('status') status?: string) {
    return this.servicesService.findAll({ status });
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.servicesService.findBySlug(slug);
  }

  @ApiBearerAuth()
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.servicesService.remove(id);
  }
}
