import { Controller, Get, Post, Body, Put, Query,Param, Delete,UseInterceptors, Res,UploadedFile,UseGuards,BadRequestException,NotFoundException, ParseFloatPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '../authentication/guards/auth.guard';
import { CreateBulkProductsDto } from './dto/create-bulk-products.dto';
import { FileUploadInterceptor } from '../common/file-upload.interceptor'; // Import the custom interceptor
import { Response } from 'express';
import { ExportService } from 'src/export/export.service';


@Controller('products')
//@UseGuards(AuthGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly exportService: ExportService
  ) {}

  @Post()
  @UseInterceptors(FileUploadInterceptor.upload(),)
  create(@Body() createProductDto: CreateProductDto, @UploadedFile() file: Express.Multer.File) {
    const imagePath = file  ? `/uploads/${file.filename}` : '';
    const productData = { ...createProductDto, imagePath };
    return this.productsService.create(productData);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('category/:categoryId')
  getProductsByCategory(@Param('categoryId') categoryId: string) {
    return this.productsService.getProductsByCategory(categoryId);
  }
  
  @Get('price-range')
  async getProductsByPriceRange(
    @Query('min', new ParseFloatPipe()) min: number,
    @Query('max', new ParseFloatPipe()) max: number,
  ) {
    if (min > max) {
      throw new BadRequestException('Minimum price cannot be greater than maximum price');
    }
    
    const products = await this.productsService.getProductsByPriceRange(min, max);
    
    if (products.length === 0) {
      throw new NotFoundException('No products found in this price range');
    }
    
    return products;
  }

  
  @Get('filter')
  async filterProducts(
    @Query('name') name?: string,
    @Query('category') category?: string,
    @Query('price') price?: string,
  ) {
    if (!name && !category && !price) {
      throw new BadRequestException('At least one filter is required');
    }

    const filters = {
      ...(name && { name }),
      ...(category && { category }),
      ...(price && { price: parseFloat(price) }),
    };

    return this.productsService.filterProducts(filters);
  }

 
  @Get('page')
  async getPaginatedProducts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.productsService.getPaginatedProducts(pageNumber, limitNumber);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }


  @Post('bulk')
@UseInterceptors(FileUploadInterceptor.uploadMultiple())
async createBulk(
  @Body() createBulkProductsDto: CreateBulkProductsDto,
  @UploadedFile() file: Express.Multer.File
) {
  const imagePath = file ? `/uploads/${file.filename}` : null;
  return this.productsService.createBulk(createBulkProductsDto.products, imagePath);
}


  
  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: CreateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }


  @Get('export/:format')
  async exportProducts(
    @Param('format') format: string,
    @Res() res: Response
  ) {
    const products = await this.productsService.findAll();
    const headers = ['product_id', 'code', 'name', 'description', 'price', 'category', 'status'];

    const formattedData = products.map(product => ({
      ...product,
      category: product.category.name,
      price: Number(product.price)
    }));

    
    const exportData = this.exportService.formatDataForExport(formattedData, format);
  
    switch (format.toLowerCase()) {
      case 'excel':
        const excelBuffer = await this.exportService.exportToExcel(exportData);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
        res.send(excelBuffer);
        break;
  
      case 'pdf':
        const pdfBuffer = await this.exportService.exportToPDF(
          exportData,
          headers,
          'Products Report'
        );
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=products.pdf');
        res.send(pdfBuffer);
        break;
  
      case 'csv':
        const csv = await this.exportService.exportToCSV(exportData, headers);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
        res.send(csv);
        break;
  
      default:
        throw new BadRequestException('Unsupported format. Use excel, pdf, or csv');
    }
  }

  
  @Get('export/:productId/:format')
  async exportProductData(
    @Param('productId') productId: number,
    @Param('format') format: string,
    @Res() res: Response
  ) {
    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const headers = ['product_id', 'code', 'name', 'description', 'price', 'category', 'status'];
    
    const formattedData = [{
      ...product,
      category: product.category.name,
      price: Number(product.price)
    }];

    switch (format.toLowerCase()) {
      case 'excel':
        const excelBuffer = await this.exportService.exportToExcel(formattedData);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=product_${productId}.xlsx`);
        res.send(excelBuffer);
        break;
  
      case 'pdf':
        const pdfBuffer = await this.exportService.exportToPDF(
          formattedData,
          headers,
          `Product ${productId} Details`
        );
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=product_${productId}.pdf`);
        res.send(pdfBuffer);
        break;
  
      case 'csv':
        const csv = await this.exportService.exportToCSV(formattedData, headers);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=product_${productId}.csv`);
        res.send(csv);
        break;
  
      default:
        throw new BadRequestException('Unsupported format. Use excel, pdf, or csv');
    }
  }
  

}
