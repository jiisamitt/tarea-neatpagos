import { Component, inject, OnInit } from '@angular/core';
import { AuthStateService } from '../../../shared/data-access/auth-state.service';
import { Router } from '@angular/router';
import { timer, Subscription } from 'rxjs';
import { CryptoScrapeService } from '../../utils/crypto-scrape.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/data-access/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styles: ``,
})
export default class DashboardComponent implements OnInit {
  private _authState = inject(AuthStateService);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _cryptoScrapeService = inject(CryptoScrapeService);
  private subscription: Subscription = new Subscription();
  public cryptocurrencyData: any;
  // public user parsed
  public user: any;

  ngOnInit(): void {
    if (this._authState.currentUser) {
      const uid = this._authState.currentUser.uid;
      this._authService.getUserData(uid).then((userSnap) => {
        if (userSnap.exists()) {
          this.user = userSnap.data();
        }
      });
    }

    this.subscription = timer(0, 30000).subscribe(() => {
      this._cryptoScrapeService.fetchCryptocurrencyData().then((data) => {
        this.cryptocurrencyData = data;
      });
    });
  }

  calculateValue(key: unknown, value: unknown): number {
    const currencyKey = key as string;
    const currencyValue = value as number;

    const coin = this.cryptocurrencyData?.find(
      (coin: any) => coin.symbol === currencyKey
    );
    return currencyValue * (coin?.current_price || 0);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  prettyNumber(num: number): string {
    return num.toLocaleString('de-DE');
  }

  goToTrade() {
    this._router.navigateByUrl('/dashboard/trade');
  }

  goToHistory() {
    this._router.navigateByUrl('/dashboard/history');
  }

  logOut() {
    this._authState.logOut();
    this._router.navigateByUrl('/auth/sign-in');
  }
}
