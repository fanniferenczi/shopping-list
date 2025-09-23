import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideAnalytics, getAnalytics } from '@angular/fire/analytics';

import { routes } from './app.routes';

const firebaseConfig = {
  apiKey: 'AIzaSyD4y3wrTd_L8iyuZ5PZErZWD0TeKRmh6hk',
  authDomain: 'shopping-list-eb050.firebaseapp.com',
  projectId: 'shopping-list-eb050',
  storageBucket: 'shopping-list-eb050.firebasestorage.app',
  messagingSenderId: '928814225023',
  appId: '1:928814225023:web:45b6ebf3e995322489514a',
  measurementId: 'G-RKSPH4TN0H',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideAnalytics(() => getAnalytics()),
  ],
};
