import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { CatalogItem, Customer, Order } from '../../core/models/erp.models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <div class="space-y-6">
      <header>
        <h1 class="text-2xl font-bold text-slate-800">Vendas & Ordens de Serviço</h1>
        <p class="text-sm text-slate-500">Emissão de pedidos com baixa automática de estoque e controle financeiro</p>
      </header>

      <!-- Novo Pedido -->
      <form (ngSubmit)="createOrder()" class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-slate-600 mb-1">Cliente</label>
          <select [(ngModel)]="selectedCustomerId" name="customer" required class="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">Selecione um cliente...</option>
            @for (c of customers(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Produto / Serviço</label>
          <select [(ngModel)]="selectedItemId" name="item" required class="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">Selecione...</option>
            @for (i of catalog(); track i.id) {
              <option [value]="i.id">{{ i.name }} ({{ i.price | currency:'BRL' }})</option>
            }
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Quantidade</label>
          <input type="number" [(ngModel)]="quantity" name="quantity" min="1" required class="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition">
          Emitir Pedido
        </button>
      </form>

      <!-- Listagem -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th class="p-4">Data</th>
              <th class="p-4">Cliente</th>
              <th class="p-4">Item</th>
              <th class="p-4">Qtd</th>
              <th class="p-4">Total</th>
              <th class="p-4">Status</th>
              <th class="p-4 text-right">Financeiro</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            @for (o of orders(); track o.id) {
              <tr class="hover:bg-slate-50">
                <td class="p-4 text-slate-500">{{ o.createdAt }}</td>
                <td class="p-4 font-medium text-slate-800">{{ o.customerName }}</td>
                <td class="p-4 text-slate-600">{{ o.itemName }}</td>
                <td class="p-4">{{ o.quantity }}</td>
                <td class="p-4 font-semibold text-slate-800">{{ o.total | currency:'BRL' }}</td>
                <td class="p-4">
                  <span class="px-2 py-1 text-xs rounded-full font-medium"
                    [ngClass]="o.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                    {{ o.status === 'PAID' ? 'Liquidado' : 'Pendente' }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  @if (o.status === 'PENDING') {
                    <button (click)="markAsPaid(o)" class="text-xs bg-slate-800 text-white px-3 py-1 rounded hover:bg-slate-700">
                      Baixar Pagamento
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  private api = inject(ApiService);

  orders = signal<Order[]>([]);
  customers = signal<Customer[]>([]);
  catalog = signal<CatalogItem[]>([]);

  selectedCustomerId = '';
  selectedItemId = '';
  quantity = 1;

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    forkJoin({
      orders: this.api.getOrders(),
      customers: this.api.getCustomers(),
      catalog: this.api.getCatalog()
    }).subscribe(({ orders, customers, catalog }) => {
      this.orders.set(orders);
      this.customers.set(customers);
      this.catalog.set(catalog);
    });
  }

  createOrder(): void {
    const customer = this.customers().find(c => c.id === this.selectedCustomerId);
    const item = this.catalog().find(i => i.id === this.selectedItemId);
    if (!customer || !item) return;

    const newOrder: Order = {
      customerId: customer.id!,
      customerName: customer.name,
      itemName: item.name,
      quantity: this.quantity,
      total: item.price * this.quantity,
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.api.createOrder(newOrder).subscribe(() => {
      if (item.type === 'PRODUCT' && item.id && item.stock !== null) {
        const updatedStock = Math.max(0, item.stock - this.quantity);
        this.api.updateStock(item.id, updatedStock).subscribe(() => this.loadAll());
      } else {
        this.loadAll();
      }
      this.selectedCustomerId = '';
      this.selectedItemId = '';
      this.quantity = 1;
    });
  }

  markAsPaid(order: Order): void {
    if (!order.id) return;
    this.api.updateOrderStatus(order.id, 'PAID').subscribe(() => this.loadAll());
  }
}
