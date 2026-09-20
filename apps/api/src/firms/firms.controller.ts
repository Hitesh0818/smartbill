import { Controller, Get, Headers, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthUser } from "../auth/auth-user.decorator";
import { FirmsService } from "./firms.service";

@UseGuards(JwtAuthGuard)
@Controller("firms")
export class FirmsController {
  constructor(private readonly firms: FirmsService) {}

  @Get()
  list(@AuthUser() user: { sub: string }) {
    return this.firms.list(user.sub);
  }

  @Get(":firmId")
  get(@AuthUser() user: { sub: string }, @Param("firmId") firmId: string) {
    return this.firms.get(user.sub, firmId);
  }
}