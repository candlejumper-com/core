import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UserService } from "../services/user/user.service";

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {

  constructor(private userService: UserService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.userService.getJWTToken()

    if (token) {
      return next.handle(req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + token
        }
      }))
    }

    return next.handle(req)
  }
}
