import { Controller, Get, Param, Put, Body, UseGuards } from '@nestjs/common';
import { StockService } from './stock.service';
import { AuthGuard } from '../authentication/guards/auth.guard';

@Controller('stock')
//@UseGuards(AuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  findAll() {
    return this.stockService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(+id);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.stockService.findByProduct(+productId);
  }

  @Put(':id')
  updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number
  ) {
    return this.stockService.updateStock(+id, quantity);
  }
}
