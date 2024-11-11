import { Component, inject, OnInit } from '@angular/core';
import { AuthStateService } from '../../../shared/data-access/auth-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { CryptoScrapeService } from '../../utils/crypto-scrape.service';
import { Subscription, timer } from 'rxjs';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trade.component.html',
  styles: ``,
})
export default class TradeComponent implements OnInit {
  private _authState = inject(AuthStateService);
  private _authService = inject(AuthService);
  private _cryptoScrapeService = inject(CryptoScrapeService);
  private subscription: Subscription = new Subscription();
  public cryptocurrencyData: any;
  private _router = inject(Router);

  public user: any;
  public uid: string = '';
  public amount: number = 0;
  public currency: string = 'btc';
  public price: any = null;
  public userCurrencies: any[] = [];

  ngOnInit(): void {
    // Initial user data fetch
    if (this._authState.currentUser) {
      this.uid = this._authState.currentUser.uid;
      this._authService.getUserData(this.uid).then((userSnap) => {
        if (userSnap.exists()) {
          this.user = userSnap.data();
          this.userCurrencies = this.getUserCurrencies();
        }
      });
    }

    // Fetch cryptocurrency data every 30 seconds and update the price
    this.subscription = timer(0, 30000).subscribe(() => {
      this._cryptoScrapeService.fetchCryptocurrencyData().then((data) => {
        this.cryptocurrencyData = data;
        this.updatePrice(); // Refresh price based on the selected currency
      });
    });
  }

  updatePrice() {
    this.price = this.getPrice(this.currency);
  }

  prettyNumber(num: number): string {
    return num.toLocaleString('de-DE');
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

  checkCapital() {
    if (!this.price || this.amount <= 0) return false;
    return this.user.capital >= this.amount * this.price;
  }

  checkCurrency() {
    if (this.amount <= 0) return false;
    return this.user.currencies[this.currency] >= this.amount;
  }

  buyCrypto() {
    if (!this.checkCapital()) {
      toast.error('No tienes suficiente capital para comprar cripto');
      return;
    }
    this._authState
      .buyCrypto(this.uid, this.amount, this.currency, 'bought', this.price)
      .then((updatedUser) => {
        toast.success('Cripto comprada con exito');
        this.user = updatedUser;
        this.userCurrencies = this.getUserCurrencies();
      })
      .catch((error) => {
        toast.error('Error al comprar cripto', error);
      });
  }

  sellCrypto() {
    if (!this.checkCurrency()) {
      toast.error('No tienes suficiente cripto para vender');
      return;
    }
    this._authState
      .sellCrypto(this.uid, this.amount, this.currency, 'sold', this.price)
      .then((updatedUser) => {
        toast.success('Cripto vendida con exito');
        this.user = updatedUser;
        this.userCurrencies = this.getUserCurrencies();
      })
      .catch((error) => {
        toast.error('Error al vender cripto', error);
      });
  }

  getPrice(symbol: string): number | null {
    const crypto = this.cryptocurrencyData.find(
      (c: any) => c.symbol === symbol
    );
    return crypto ? crypto.current_price : null;
  }

  getUserCurrencies() {
    if (!this.user?.currencies || !this.cryptocurrencyData) return [];

    return Object.keys(this.user.currencies).map((symbol) => {
      const cryptoData = this.cryptocurrencyData.find(
        (c: any) => c.symbol === symbol
      );
      return {
        symbol: symbol,
        name: cryptoData ? cryptoData.name : symbol.toUpperCase(),
        amount: this.user.currencies[symbol],
        price: cryptoData ? cryptoData.current_price : null,
      };
    });
  }

  goToDashboard() {
    this._router.navigateByUrl('/dashboard');
  }
}
