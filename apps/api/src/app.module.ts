import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { FirmsModule } from "./firms/firms.module";
import { CustomersModule } from "./customers/customers.module";
import { ProductsModule } from "./products/products.module";
import { InvoicesModule } from "./invoices/invoices.module";
import { DashboardModule } from "./dashboard/dashboard.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    FirmsModule,
    CustomersModule,
    ProductsModule,
    InvoicesModule,
    DashboardModule,
  ],
})
export class AppModule {}