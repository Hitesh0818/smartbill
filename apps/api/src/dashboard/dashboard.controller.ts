import { Controller, Get, Headers, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthUser } from "../auth/auth-user.decorator";
import { DashboardService } from "./dashboard.service";

@UseGuards(JwtAuthGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get("summary")
  summary(@AuthUser() user: { sub: string }, @Headers("x-firm-id") firmId: string) {
    return this.service.summary(user.sub, firmId);
  }
}