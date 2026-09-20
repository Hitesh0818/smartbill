import { Body, Controller, Get, Headers, Post, UseGuards } from "@nestjs/common";
import { ArrayMinSize, IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthUser } from "../auth/auth-user.decorator";
import { InvoicesService } from "./invoices.service";

class ItemDto {
  @IsOptional() @IsString() productId?: string;
  @IsString() name!: string;
  @Type(() => Number) @IsNumber() quantity!: number;
  @Type(() => Number) @IsNumber() unitPrice!: number;
  @Type(() => Number) @IsNumber() gstRate!: number;
  @Type(() => Number) @IsOptional() @IsNumber() discountPercent?: number;
  @IsOptional() @IsString() hsnSac?: string;
}

class CreateInvoiceDto {
  @IsString() customerId!: string;
  @IsOptional() @IsString() dueDate?: string;
  @IsOptional() @IsString() notes?: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ItemDto) items!: ItemDto[];
}

@UseGuards(JwtAuthGuard)
@Controller("invoices")
export class InvoicesController {
  constructor(private readonly service: InvoicesService) {}

  @Get()
  list(@AuthUser() user: { sub: string }, @Headers("x-firm-id") firmId: string) {
    return this.service.list(user.sub, firmId);
  }

  @Post()
  create(@AuthUser() user: { sub: string }, @Headers("x-firm-id") firmId: string, @Body() dto: CreateInvoiceDto) {
    return this.service.create(user.sub, firmId, dto);
  }
}