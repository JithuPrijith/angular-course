import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthData } from './auth-data.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token!: string | null | undefined;
  private authStatusListener = new Subject<boolean>();
  private isAuthenticated = false;
  private tokenTimer : any;

  constructor(private http: HttpClient, private router: Router) {}

  createUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http
      .post('http://localhost:3000/api/user/signup', authData)
      .subscribe((response: any) => {
      });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http
      .post<{ token: string, expiresIn: number }>('http://localhost:3000/api/user/login', authData)
      .subscribe((response: any) => {
        const token = response.token;
        const expiresIn = response.expiresIn;
        this.setAuthTimer(expiresIn);
        this.token = token;
        if (token) {
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresIn * 1000);
          this.saveAuthData(token, expirationDate)
          this.isAuthenticated = true;
          this.router.navigate(['/']);
        }
      });
  }

  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData()
    this.router.navigate(['/']);
  }

  autoAuthUser(){
   const authInformation =  this.getAuthData()
   if(!authInformation){
    return;
   }
   const now  = new Date();
   let expiresIn;
   if(authInformation?.expirationDate){
    expiresIn = authInformation?.expirationDate.getTime() - now.getTime();
   }
   if(expiresIn != undefined){
    if(expiresIn > 0){
        this.token = authInformation?.token;
        this.isAuthenticated = true;
        this.setAuthTimer(expiresIn/1000);
        this.authStatusListener.next(true);
    }
   }
  }

  private saveAuthData(token : string, expirationDate : Date){
    localStorage.setItem("token",token);
    localStorage.setItem("expiration",expirationDate.toISOString())
  }

  private clearAuthData(){
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
  }

  private getAuthData(){
    const token = localStorage.getItem("token");
    const expiration = localStorage.getItem("expiration");
    if(!token || !expiration){
        return;
    }
    return {
        token : token,
        expirationDate: new Date(expiration)
    }
  }

  private setAuthTimer(duration : number){
    this.tokenTimer = setTimeout(() => {
        this.logout();
    }, duration * 1000);
  }
}
