import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  RawBodyRequest,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackedDataDto } from './trackedData.dto';

@Controller()
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('/count')
  @HttpCode(200)
  async getCount(): Promise<number> {
    return await this.trackingService.getCount();
  }

  @Post('/track')
  @HttpCode(204)
  @UsePipes(new ValidationPipe({ transform: true }))
  async track(
    @Body() data: TrackedDataDto,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!req.rawBody) {
      throw Error('Unable to obtain data.'); // this can happen if NestJS is misconfigured, see: https://docs.nestjs.com/faq/raw-body
    }

    await this.trackingService.track({
      count: data.count,
      rawJson: req.rawBody,
    });
  }
}
