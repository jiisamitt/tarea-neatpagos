import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'tarea-neatpagos',
        appId: '1:238873904905:web:c2472677cfcc84404e75d8',
        storageBucket: 'tarea-neatpagos.firebasestorage.app',
        apiKey: 'AIzaSyDs0_kvuKN-D6PTqYef99u7azzEiYD1OyY',
        authDomain: 'tarea-neatpagos.firebaseapp.com',
        messagingSenderId: '238873904905',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideHttpClient(),
  ],
};
