import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { FirmsModule } from "../firms/firms.module";

@Module({
  imports: [FirmsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}