import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/data-access/auth.service';
import { AuthStateService } from '../../../shared/data-access/auth-state.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styles: ``,
})
export default class HistoryComponent implements OnInit {
  private _authState = inject(AuthStateService);
  private _router = inject(Router);

  public transactions: any[] = [];

  ngOnInit(): void {
    if (this._authState.currentUser) {
      const uid = this._authState.currentUser.uid;
      this._authState.getUserTransactions(uid).then((querySnapshot) => {
        if (querySnapshot.docs.length > 0) {
          this.transactions = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          this.transactions.sort((a, b) => b.date.seconds - a.date.seconds);
        }
      });
    }
  }
  formatDateTime(date: { seconds: number; nanoseconds: number }) {
    const timestamp = date.seconds * 1000 + date.nanoseconds / 1000000;
    return new Date(timestamp);
  }
  prettyNumber(num: number): string {
    return num.toLocaleString('de-DE');
  }

  goToDashboard() {
    this._router.navigate(['/dashboard']);
  }
}
