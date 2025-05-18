import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  
  // Mock user for development purposes
  private mockUser: User = {
    id: 1,
    name: 'Usuario Demo',
    email: 'demo@example.com',
    phone: '+34 612345678',
    role: 'guest'
  };

  constructor(private http: HttpClient) {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // Get current user value
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Login
  login(email: string, password: string): Observable<User> {
    // En un entorno real: return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password })
    
    // Mock login for development
    if (email === 'demo@example.com' && password === 'password') {
      localStorage.setItem('currentUser', JSON.stringify(this.mockUser));
      this.currentUserSubject.next(this.mockUser);
      return of(this.mockUser);
    } else {
      return throwError(() => new Error('Email o contraseña incorrectos'));
    }
  }

  // Register
  register(user: User): Observable<User> {
    // En un entorno real: return this.http.post<User>(`${this.apiUrl}/auth/register`, user)
    
    // Mock register for development
    const newUser: User = {
      ...user,
      id: 1,
      role: 'guest',
      createdAt: new Date()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    this.currentUserSubject.next(newUser);
    return of(newUser);
  }

  // Logout
  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }
}