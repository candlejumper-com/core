import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../local-storage/local-storage.service';

export interface IUser {
  id?: number
  username?: string
  password?: string
  broker?: string
  brokerAPIKey?: string
  brokerAPISecret?: string
  production?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  user: IUser

  constructor(private httpClient: HttpClient, private localStorageService: LocalStorageService) { }

  setUser(user: IUser): void {
    this.user = user
  }

  login(username: string, password: string) {
    return this.httpClient.post<{ token: string }>('/api/user/login', { username, password })
  }

  logout(): void {
    this.clearJWTToken()
    window.location.reload()
  }

  create(params: IUser): Observable<any> {
    return this.httpClient.post('/api/user', params)
  }

  toggleProductionMode(state: boolean): Observable<any> {
    return this.httpClient.post('/api/user/production-mode', { state })
  }

  getJWTToken(): string {
    return this.localStorageService.get('jwt')
  }

  setJWTToken(token: string): void {
    this.localStorageService.set('jwt', token)
  }

  clearJWTToken(): void {
    this.localStorageService.delete('jwt')
  }
}
