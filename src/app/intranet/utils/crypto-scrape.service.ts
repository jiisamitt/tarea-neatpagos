import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CryptoScrapeService {
  private url = 'https://api.coingecko.com/api/v3/coins/markets';
  private params = {
    vs_currency: 'usd',
    ids: 'bitcoin,ethereum,ripple,bitcoin-cash,cardano,litecoin,nem,stellar',
    sparkline: false,
  };

  constructor(private http: HttpClient) {}

  fetchCryptocurrencyData(): Promise<any> {
    return this.http.get(this.url, { params: this.params }).toPromise();
  }
}
