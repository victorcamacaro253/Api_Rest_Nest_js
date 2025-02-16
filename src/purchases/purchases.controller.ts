import { Controller, Get, Post, Body, Param, UseGuards,Query, ParseFloatPipe,Delete } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { AuthGuard } from '../authentication/guards/auth.guard';
import { ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';


@Controller('purchases')
//@UseGuards(AuthGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  create(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchasesService.create(createPurchaseDto);
  }

  @Get()
  findAll() {
    return this.purchasesService.findAll();
  }

  @Get('price-range')
findByPriceRange(
  @Query('min', ParseFloatPipe) min: number,
  @Query('max', ParseFloatPipe) max: number,
) {
  return this.purchasesService.findByPriceRange(min, max);
}

@Get('date-range')
findByDateRange(
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
) {
  return this.purchasesService.findByDateRange(startDate, endDate);
}

@Get('user-date-range/:userId')
findByUserAndDateRange(
  @Param('userId') userId: number,
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
) {
  return this.purchasesService.findByUserAndDateRange(userId, startDate, endDate);
}

@Get('statistics')
getStatistics(
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
) {
  return this.purchasesService.getStatistics(startDate, endDate);
}


@Get('statistics/user/:userId')
@ApiParam({ name: 'userId', required: false, description: 'ID del usuario' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Fecha de inicio para las estadísticas' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Fecha de fin para las estadísticas' })
getUserStatistics(
  @Param('userId') userId: number,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
) {
  return this.purchasesService.getUserStatistics(userId, startDate, endDate);
}


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchasesService.findOne(+id);
  }

  

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.purchasesService.findByUser(+userId);
  }


  @Delete(':id')
async remove(@Param('id') id: number) {
  return this.purchasesService.remove(id);
}

}
