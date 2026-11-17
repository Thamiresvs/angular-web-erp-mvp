import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CatalogItem, Customer, Order } from '../models/erp.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // Customers
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.baseUrl}/customers`);
  }
  createCustomer(data: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${this.baseUrl}/customers`, data);
  }
  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/customers/${id}`);
  }

  // Catalog (Products & Services)
  getCatalog(): Observable<CatalogItem[]> {
    return this.http.get<CatalogItem[]>(`${this.baseUrl}/catalog`);
  }
  createCatalogItem(data: CatalogItem): Observable<CatalogItem> {
    return this.http.post<CatalogItem>(`${this.baseUrl}/catalog`, data);
  }
  updateStock(id: string, stock: number): Observable<CatalogItem> {
    return this.http.patch<CatalogItem>(`${this.baseUrl}/catalog/${id}`, { stock });
  }

  // Orders & Service Orders
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }
  createOrder(data: Order): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders`, data);
  }
  updateOrderStatus(id: string, status: Order['status']): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/orders/${id}`, { status });
  }
}
