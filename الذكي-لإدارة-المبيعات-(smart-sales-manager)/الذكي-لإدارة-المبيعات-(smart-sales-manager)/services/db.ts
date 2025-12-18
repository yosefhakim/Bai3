
import { Product, Customer, Sale, Expense, StockMovement } from '../types';

const DB_NAME = 'SmartSellerDB_V3';
const DB_VERSION = 1;

export class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('customers')) {
          db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('sales')) {
          db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('expenses')) {
          db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('movements')) {
          db.createObjectStore('movements', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = () => reject('Failed to open IndexedDB');
    });
  }

  private getStore(name: string, mode: IDBTransactionMode = 'readonly') {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(name, mode);
    return transaction.objectStore(name);
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve) => {
      const store = this.getStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async add<T>(storeName: string, item: T): Promise<number> {
    return new Promise((resolve) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.add(item);
      request.onsuccess = () => resolve(request.result as number);
    });
  }

  async update<T>(storeName: string, item: T): Promise<void> {
    return new Promise((resolve) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.put(item);
      request.onsuccess = () => resolve();
    });
  }

  async delete(storeName: string, id: number): Promise<void> {
    return new Promise((resolve) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
    });
  }

  async getById<T>(storeName: string, id: number): Promise<T | undefined> {
    return new Promise((resolve) => {
      const store = this.getStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async addStock(productId: number, quantity: number): Promise<void> {
    const product = await this.getById<Product>('products', productId);
    if (product) {
      product.stock += quantity;
      await this.update('products', product);
      await this.add('movements', {
        productId,
        productName: product.name,
        type: 'IN',
        quantity,
        date: new Date().toISOString()
      } as StockMovement);
    }
  }

  async recordSale(sale: Sale): Promise<number> {
    const saleId = await this.add('sales', sale);
    for (const item of sale.items) {
      const product = await this.getById<Product>('products', item.productId);
      if (product) {
        product.stock -= item.quantity;
        await this.update('products', product);
        await this.add('movements', {
          productId: item.productId,
          productName: item.productName,
          type: 'OUT',
          quantity: item.quantity,
          date: new Date().toISOString()
        } as StockMovement);
      }
    }
    if (sale.customerId) {
      const customer = await this.getById<Customer>('customers', sale.customerId);
      if (customer) {
        customer.total_purchases += sale.total;
        await this.update('customers', customer);
      }
    }
    return saleId;
  }
}

export const dbService = new DatabaseService();
