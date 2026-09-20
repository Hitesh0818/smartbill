import { Body, Controller, Get, Headers, Post, UseGuards } from "@nestjs/common";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthUser } from "../auth/auth-user.decorator";
import { ProductsService } from "./products.service";

class CreateProductDto {
  @IsString() name!: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() hsnSac?: string;
  @Type(() => Number) @IsNumber() @Min(0) salePrice!: number;
  @Type(() => Number) @IsNumber() @Min(0) gstRate!: number;
  @Type(() => Number) @IsOptional() @IsNumber() currentStock?: number;
  @IsOptional() @IsString() unit?: string;
}

@UseGuards(JwtAuthGuard)
@Controller("products")
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  list(@AuthUser() user: { sub: string }, @Headers("x-firm-id") firmId: string) {
    return this.service.list(user.sub, firmId);
  }

  @Post()
  create(
    @AuthUser() user: { sub: string },
    @Headers("x-firm-id") firmId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.service.create(user.sub, firmId, dto);
  }
}