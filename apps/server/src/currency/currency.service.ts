// services/currency.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Currency } from 'src/payment/enums/currency.enum';

@Injectable()
export class CurrencyService {
  private exchangeRates: Map<string, number> = new Map();

  constructor() {
    this.updateExchangeRates(); // Initial load
    setInterval(() => this.updateExchangeRates(), 3600000); // Update hourly
  }

  async updateExchangeRates() {
    try {
      const response = await axios.get(
        process.env.EXCHANGE_RATES_URL as string,
      );
      if (
        response.status !== 200 ||
        !response.data ||
        response.data.result !== 'success'
      ) {
        throw new Error('Invalid response from exchange rate API');
      }

      const rates = response.data.rates;
      Object.keys(rates).forEach((currency) => {
        this.exchangeRates.set(currency, rates[currency]);
      });
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
    }
  }

  getExchangeRate(fromCurrency: Currency, toCurrency: Currency): number {
    if (fromCurrency === toCurrency) return 1;

    if (fromCurrency === Currency.USD) {
      return this.exchangeRates.get(toCurrency) || 1;
    }

    if (toCurrency === Currency.USD) {
      const rate = this.exchangeRates.get(fromCurrency);
      return rate ? 1 / rate : 1;
    }

    // For non-USD pairs, convert through USD
    const usdToFrom = this.exchangeRates.get(fromCurrency) || 1;
    const usdToTo = this.exchangeRates.get(toCurrency) || 1;
    return usdToTo / usdToFrom;
  }

  convertToUSD(amount: number, fromCurrency: Currency): number {
    if (fromCurrency === Currency.USD) return amount;
    const rate = this.exchangeRates.get(fromCurrency);
    return rate ? amount / rate : amount;
  }

  convertFromUSD(amount: number, toCurrency: Currency): number {
    if (toCurrency === Currency.USD) return amount;
    const rate = this.exchangeRates.get(toCurrency);
    return rate ? amount * rate : amount;
  }
}
