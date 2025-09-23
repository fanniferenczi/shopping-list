import { Injectable, OnInit } from '@angular/core';
import { Auth, signInAnonymously, User, authState } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { Analytics, setUserId } from '@angular/fire/analytics';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private auth: Auth, private analytics: Analytics) {
    authState(this.auth).subscribe((user) => {
      this.userSubject.next(user);
      if (!user) {
        this.signInAnonymously();
      } else {
        setUserId(this.analytics, user.uid);
      }
    });
  }

  async signInAnonymously(): Promise<void> {
    try {
      await signInAnonymously(this.auth);
    } catch (error) {
      console.error('Error signing in anonymously:', error);
    }
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  getUserId(): string {
    return this.auth.currentUser?.uid ?? '';
  }
}
