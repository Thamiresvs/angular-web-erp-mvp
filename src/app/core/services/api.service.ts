import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CatalogItem, Customer, Order } from '../models/erp.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private readonly SEED_CUSTOMERS: Customer[] = [
    { id: '1', name: 'Padaria Estrela do Sul Ltda', document: '12.345.678/0001-90', email: 'contato@estreladosul.com.br', phone: '(21) 99876-5432', segment: 'Comércio' },
    { id: '2', name: 'Clínica Odontológica Sorriso', document: '98.765.432/0001-10', email: 'financeiro@clinicasorriso.com.br', phone: '(21) 98765-4321', segment: 'Serviços' }
  ];

  private readonly SEED_CATALOG: CatalogItem[] = [
    { id: '1', sku: 'PRD-001', name: 'Terminal PDV Touch 15"', type: 'PRODUCT', price: 1850.00, stock: 14 },
    { id: '2', sku: 'SRV-001', name: 'Consultoria & Implantação Fiscal', type: 'SERVICE', price: 650.00, stock: null },
    { id: '3', sku: 'PRD-002', name: 'Leitor de Código de Barras Sem Fio', type: 'PRODUCT', price: 320.00, stock: 4 }
  ];

  private readonly SEED_ORDERS: Order[] = [
    { id: '101', customerId: '1', customerName: 'Padaria Estrela do Sul Ltda', itemName: 'Terminal PDV Touch 15"', quantity: 2, total: 3700.00, status: 'PAID', createdAt: '2026-11-10' },
    { id: '102', customerId: '2', customerName: 'Clínica Odontológica Sorriso', itemName: 'Consultoria & Implantação Fiscal', quantity: 1, total: 650.00, status: 'PENDING', createdAt: '2026-11-15' }
  ];

  private getLocal<T>(key: string, seed: T[]): T[] {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  }

  private setLocal<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Customers
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.baseUrl}/customers`).pipe(
      catchError(() => of(this.getLocal('erp_customers', this.SEED_CUSTOMERS)))
    );
  }

  createCustomer(data: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${this.baseUrl}/customers`, data).pipe(
      catchError(() => {
        const list = this.getLocal('erp_customers', this.SEED_CUSTOMERS);
        const created = { ...data, id: Date.now().toString() };
        this.setLocal('erp_customers', [...list, created]);
        return of(created);
      })
    );
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/customers/${id}`).pipe(
      catchError(() => {
        const list = this.getLocal('erp_customers', this.SEED_CUSTOMERS).filter(c => c.id !== id);
        this.setLocal('erp_customers', list);
        return of(undefined);
      })
    );
  }

  // Catalog
  getCatalog(): Observable<CatalogItem[]> {
    return this.http.get<CatalogItem[]>(`${this.baseUrl}/catalog`).pipe(
      catchError(() => of(this.getLocal('erp_catalog', this.SEED_CATALOG)))
    );
  }

  createCatalogItem(data: CatalogItem): Observable<CatalogItem> {
    return this.http.post<CatalogItem>(`${this.baseUrl}/catalog`, data).pipe(
      catchError(() => {
        const list = this.getLocal('erp_catalog', this.SEED_CATALOG);
        const created = { ...data, id: Date.now().toString() };
        this.setLocal('erp_catalog', [...list, created]);
        return of(created);
      })
    );
  }

  updateStock(id: string, stock: number): Observable<CatalogItem> {
    return this.http.patch<CatalogItem>(`${this.baseUrl}/catalog/${id}`, { stock }).pipe(
      catchError(() => {
        const list = this.getLocal('erp_catalog', this.SEED_CATALOG).map(item =>
          item.id === id ? { ...item, stock } : item
        );
        this.setLocal('erp_catalog', list);
        return of(list.find(i => i.id === id)!);
      })
    );
  }

  // Orders
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`).pipe(
      catchError(() => of(this.getLocal('erp_orders', this.SEED_ORDERS)))
    );
  }

  createOrder(data: Order): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders`, data).pipe(
      catchError(() => {
        const list = this.getLocal('erp_orders', this.SEED_ORDERS);
        const created = { ...data, id: Date.now().toString() };
        this.setLocal('erp_orders', [created, ...list]);
        return of(created);
      })
    );
  }

  updateOrderStatus(id: string, status: Order['status']): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/orders/${id}`, { status }).pipe(
      catchError(() => {
        const list = this.getLocal('erp_orders', this.SEED_ORDERS).map(o =>
          o.id === id ? { ...o, status } : o
        );
        this.setLocal('erp_orders', list);
        return of(list.find(o => o.id === id)!);
      })
    );
  }
}