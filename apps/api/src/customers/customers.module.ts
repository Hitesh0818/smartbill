import { Module } from "@nestjs/common";
import { CustomersController } from "./customers.controller";
import { CustomersService } from "./customers.service";
import { FirmsModule } from "../firms/firms.module";

@Module({
  imports: [FirmsModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}