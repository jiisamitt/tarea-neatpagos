import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from '@angular/fire/firestore';
import { get } from 'request';

export interface User {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _auth = inject(Auth);
  private _firestore = inject(Firestore);

  getUserData(uid: string) {
    const userRef = doc(this._firestore, 'users', uid);
    return getDoc(userRef);
  }

  getUserTransactions(uid: string) {
    const userRef = doc(this._firestore, 'users', uid);
    const transactionsRef = collection(
      this._firestore,
      `users/${uid}/transactions`
    );
    return getDocs(transactionsRef);
  }

  signUp(user: User) {
    return createUserWithEmailAndPassword(
      this._auth,
      user.email,
      user.password
    ).then((userCredential) => {
      const uid = userCredential.user.uid;
      return this.createUserService(uid, user.email);
    });
  }
  // Get random number between 100 and 100000
  getRandomNumber() {
    return Math.floor(Math.random() * (100000 - 100 + 1) + 100);
  }

  private async createUserService(uid: string, email: string) {
    try {
      await setDoc(doc(this._firestore, 'users', uid), {
        email: email,
        capital: this.getRandomNumber(),
        currencies: {},
      });
    } catch (error) {
      console.error('Error al crear documento de usuario:', error);
    }
  }

  signIn(user: User) {
    return signInWithEmailAndPassword(this._auth, user.email, user.password);
  }

  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    return signInWithPopup(this._auth, provider).then((result) => {
      const uid = result.user.uid;
      const email = result.user.email;

      if (!email) {
        throw new Error('Email not provided by Google Auth');
      }

      return this.checkAndCreateUserService(uid, email);
    });
  }

  private async checkAndCreateUserService(uid: string, email: string) {
    try {
      const userRef = doc(this._firestore, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await this.createUserService(uid, email);
      }

      return Promise.resolve();
    } catch (error) {
      console.error('Error checking or creating user service:', error);
    }
  }
}
