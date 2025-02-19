import { Controller, Get, Post, Body, Param,Res, UseGuards,Query,BadRequestException, ParseFloatPipe,Delete } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { AuthGuard } from '../authentication/guards/auth.guard';
import { ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ExportService } from 'src/export/export.service';
import { Response } from 'express';



@Controller('purchases')
//@UseGuards(AuthGuard)
export class PurchasesController {
  constructor(
    private readonly purchasesService: PurchasesService,
    private readonly exportService: ExportService) {}

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


@Get('export/:format')
async exportPurchases(
  @Param('format') format: string,
  @Res() res: Response
) {
  const headers = ['purchase_id', 'user_id', 'amount', 'date','products','status'];
  const formattedData = await this.purchasesService.prepareExportData();

  /*
  const formattedData = purchases.map(purchase => ({
    purchase_id: purchase.purchase_id,
    user_id: purchase.user.fullname,
    amount: purchase.amount,
    date: purchase.date,
    products: purchase.purchasedProducts.map(pp => 
      `${pp.product.name} (${pp.quantity} units at $${pp.price})`
    ).join(', '),
    status: purchase.status,
    
  }));
*/
  console.log(formattedData);

  switch (format.toLowerCase()) {
    case 'excel':
      const excelBuffer = await this.exportService.exportToExcel(formattedData);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=purchases.xlsx');
      res.send(excelBuffer);
      break;

    case 'pdf':
      const pdfBuffer = await this.exportService.exportPurchaseToPDF(
        formattedData,
        headers,
        'Purchases Report'
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=purchases.pdf');
      res.send(pdfBuffer);
      break;

    case 'csv':
      const csv = await this.exportService.exportToCSV(formattedData, headers);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=purchases.csv');
      res.send(csv);
      break;

    default:
      throw new BadRequestException('Unsupported format. Use excel, pdf, or csv');
  }
}


}
