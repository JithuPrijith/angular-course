import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthData } from './auth-data.model';

const backendUrl:any = environment.apiUrl + "/user/"

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token!: string | null | undefined;
  private authStatusListener = new Subject<boolean>();
  private isAuthenticated = false;
  private tokenTimer: any;
  private userId!: string | null;

  constructor(private http: HttpClient, private router: Router) {}

  createUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http.post(backendUrl + '/signup', authData).subscribe(
      (response: any) => {
        this.router.navigate(['/login']);
      },
      (error) => {
        this.authStatusListener.next(false);
      }
    );
  }

  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http
      .post<{ token: string; expiresIn: number; userId: string }>(
        backendUrl + '/login',
        authData
      )
      .subscribe((response: any) => {
        const token = response.token;
        const expiresIn = response.expiresIn;
        this.setAuthTimer(expiresIn);
        this.token = token;
        if (token) {
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresIn * 1000);
          this.userId = response.userId;
          this.saveAuthData(token, expirationDate, this.userId);
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          this.router.navigate(['/']);
        }
      }, 
      (error) => {
        this.authStatusListener.next(false)
      });
  }

  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    console.log('entering auth status listener', this.authStatusListener);
    return this.authStatusListener.asObservable();
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    console.log(this.userId);
    return this.userId;
  }

  logout() {
    this.token = null;
    this.userId = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    let expiresIn;
    if (authInformation?.expirationDate) {
      expiresIn = authInformation?.expirationDate.getTime() - now.getTime();
    }
    if (expiresIn != undefined) {
      if (expiresIn > 0) {
        this.token = authInformation?.token;
        this.userId = authInformation.userId;
        this.isAuthenticated = true;
        this.setAuthTimer(expiresIn / 1000);
        this.authStatusListener.next(true);
      }
    }
  }

  private saveAuthData(token: string, expirationDate: Date, userId: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const expiration = localStorage.getItem('expiration');
    if (!token || !expiration) {
      return
    }
    return {
      token: token,
      expirationDate: new Date(expiration),
      userId: userId,
    };
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }
}
