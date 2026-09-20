import { createParamDecorator, ExecutionContext } from "@nestjs/common";
export const AuthUser = createParamDecorator((_data:unknown, ctx:ExecutionContext) => ctx.switchToHttp().getRequest().user as {sub:string;email:string});
