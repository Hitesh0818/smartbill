import { Body, Controller, Get, Headers, Post, UseGuards } from "@nestjs/common";
import { IsOptional, IsString } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthUser } from "../auth/auth-user.decorator";
import { CustomersService } from "./customers.service";

class CreateCustomerDto {
  @IsString() name!: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() gstin?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() stateCode?: string;
}

@UseGuards(JwtAuthGuard)
@Controller("customers")
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  list(@AuthUser() user: { sub: string }, @Headers("x-firm-id") firmId: string) {
    return this.service.list(user.sub, firmId);
  }

  @Post()
  create(
    @AuthUser() user: { sub: string },
    @Headers("x-firm-id") firmId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.service.create(user.sub, firmId, dto);
  }
}