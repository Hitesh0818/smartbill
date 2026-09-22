import { Module } from "@nestjs/common";
import { FirmsController } from "./firms.controller";
import { FirmsService } from "./firms.service";

@Module({
  controllers: [FirmsController],
  providers: [FirmsService],
  exports: [FirmsService], // <-- add this line
})
export class FirmsModule {}