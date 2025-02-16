import { Controller, Get, Post, Body, Put, Query,Param, Delete,UseInterceptors, UploadedFile,UseGuards,BadRequestException,NotFoundException, ParseFloatPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '../authentication/guards/auth.guard';
import { CreateBulkProductsDto } from './dto/create-bulk-products.dto';
import { FileUploadInterceptor } from '../common/file-upload.interceptor'; // Import the custom interceptor


@Controller('products')
//@UseGuards(AuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

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
}
