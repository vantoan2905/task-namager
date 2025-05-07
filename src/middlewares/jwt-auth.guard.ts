import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "./public-flag";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }
    /**
     * Determines whether the request is allowed to proceed.
     *
     * Checks if the route is marked as public (i.e. does not require authentication)
     * and if so, returns true. Otherwise, it calls the parent class's canActivate()
     * to perform the actual authentication check.
     *
     * @param context - Execution context
     * @returns boolean | Promise<boolean> | Observable<boolean>
     */
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);

    }
    handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
        return super.handleRequest(err, user, info, context, status);
    }
}