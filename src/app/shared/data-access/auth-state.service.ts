import { inject, Injectable } from '@angular/core';
import { Auth, authState, getAuth, signOut } from '@angular/fire/auth';
import {
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  setDoc,
} from '@angular/fire/firestore';
import { toast } from 'ngx-sonner';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private _auth = inject(Auth);
  private _firestore = inject(Firestore);

  get authState$(): Observable<any> {
    return authState(this._auth);
  }

  get currentUser() {
    return getAuth().currentUser;
  }

  getUserTransactions(uid: string) {
    const userRef = doc(this._firestore, 'users', uid);
    const transactionsRef = collection(
      this._firestore,
      `users/${uid}/transactions`
    );
    return getDocs(transactionsRef);
  }

  getRandomBoolean() {
    return Math.random() < 0.1;
  }

  buyCrypto(
    uid: string,
    amount: number,
    currency: string,
    type: string,
    price: number
  ): Promise<any> {
    const userRef = doc(this._firestore, 'users', uid);
    const transactionRef = doc(
      this._firestore,
      `users/${uid}/transactions`,
      Math.random().toString(36).substr(2, 9)
    );

    // 10% chance of failure
    if (this.getRandomBoolean()) {
      return Promise.reject('Transaction failed due to internal error.');
    }

    // Add new transaction
    return setDoc(transactionRef, {
      amount,
      currency,
      date: new Date(),
      type,
      price,
    })
      .then(() => {
        // If successful, update capital and currencies
        return getDoc(userRef).then((userSnap) => {
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const capital = userData['capital'];
            const currencies = userData['currencies'] || {};

            if (capital >= price * amount) {
              // Update capital
              const newCapital = capital - price * amount;

              // Update currencies
              const newCurrencyAmount = (currencies[currency] || 0) + amount;
              currencies[currency] = newCurrencyAmount;

              return setDoc(userRef, {
                capital: newCapital,
                currencies,
              }).then(() => {
                return getDoc(userRef).then((updatedUserSnap) => {
                  return updatedUserSnap.data();
                });
              });
            } else {
              return Promise.reject('Insufficient capital.');
            }
          } else {
            return Promise.reject('User data not found.');
          }
        });
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  sellCrypto(
    uid: string,
    amount: number,
    currency: string,
    type: string,
    price: number
  ): Promise<any> {
    const userRef = doc(this._firestore, 'users', uid);
    const transactionRef = doc(
      this._firestore,
      `users/${uid}/transactions`,
      Math.random().toString(36).substr(2, 9)
    );

    // 10% chance of failure
    if (this.getRandomBoolean()) {
      return Promise.reject('Transaction failed due to internal error.');
    }

    // Add new transaction
    return getDoc(userRef)
      .then((userSnap) => {
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const currencies = userData['currencies'] || {};

          // Check if user has sufficient currency to sell
          if (currencies[currency] >= amount) {
            return setDoc(transactionRef, {
              amount: -amount, // Negative amount to indicate sell
              currency,
              date: new Date(),
              type,
              price,
            }).then(() => {
              // Update capital and currencies
              const capital = userData['capital'];
              const newCapital = capital + price * amount;
              const newCurrencyAmount = currencies[currency] - amount;
              currencies[currency] = newCurrencyAmount;

              return setDoc(userRef, {
                capital: newCapital,
                currencies,
              }).then(() => {
                return getDoc(userRef).then((updatedUserSnap) => {
                  return updatedUserSnap.data();
                });
              });
            });
          } else {
            return Promise.reject('Insufficient currency to sell.');
          }
        } else {
          return Promise.reject('User data not found.');
        }
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  logOut() {
    return signOut(this._auth);
  }
}
