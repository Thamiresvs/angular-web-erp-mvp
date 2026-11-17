import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { CatalogItem, Customer, Order } from '../../core/models/erp.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="space-y-6">
      <header>
        <h1 class="text-2xl font-bold text-slate-800">Visão Geral do Negócio</h1>
        <p class="text-sm text-slate-500">Indicadores consolidados de vendas, serviços e estoque</p>
      </header>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-medium uppercase text-slate-400">Receita Confirmada</span>
          <p class="text-2xl font-bold text-emerald-600 mt-1">{{ totalPaid() | currency:'BRL' }}</p>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-medium uppercase text-slate-400">A Receber (Pendente)</span>
          <p class="text-2xl font-bold text-amber-600 mt-1">{{ totalPending() | currency:'BRL' }}</p>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-medium uppercase text-slate-400">Clientes Ativos</span>
          <p class="text-2xl font-bold text-slate-800 mt-1">{{ customers().length }}</p>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-medium uppercase text-slate-400">Alerta Estoque Baixo</span>
          <p class="text-2xl font-bold text-rose-600 mt-1">{{ lowStockItems().length }}</p>
        </div>
      </div>

      <!-- Recent Orders & Low Stock -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 class="font-semibold text-slate-800 mb-4">Últimas Movimentações</h2>
          <div class="divide-y divide-slate-100">
            @for (order of orders().slice(0, 5); track order.id) {
              <div class="py-3 flex justify-between items-center">
                <div>
                  <p class="font-medium text-slate-700">{{ order.customerName }}</p>
                  <p class="text-xs text-slate-500">{{ order.itemName }} ({{ order.quantity }}x)</p>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-slate-800">{{ order.total | currency:'BRL' }}</p>
                  <span class="text-xs px-2 py-0.5 rounded-full"
                    [ngClass]="order.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                    {{ order.status === 'PAID' ? 'Pago' : 'Pendente' }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 class="font-semibold text-slate-800 mb-4">Produtos com Estoque Crítico (&le; 5 un.)</h2>
          @if (lowStockItems().length === 0) {
            <p class="text-sm text-slate-500">Todos os produtos estão com estoque adequado.</p>
          } @else {
            <div class="space-y-3">
              @for (item of lowStockItems(); track item.id) {
                <div class="flex justify-between items-center p-3 bg-rose-50 rounded-lg border border-rose-100">
                  <div>
                    <p class="font-medium text-slate-800">{{ item.name }}</p>
                    <p class="text-xs text-slate-500">SKU: {{ item.sku }}</p>
                  </div>
                  <span class="font-bold text-rose-700">{{ item.stock }} un.</span>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  orders = signal<Order[]>([]);
  customers = signal<Customer[]>([]);
  catalog = signal<CatalogItem[]>([]);

  totalPaid = computed(() =>
    this.orders().filter(o => o.status === 'PAID').reduce((acc, o) => acc + o.total, 0)
  );

  totalPending = computed(() =>
    this.orders().filter(o => o.status === 'PENDING').reduce((acc, o) => acc + o.total, 0)
  );

  lowStockItems = computed(() =>
    this.catalog().filter(i => i.type === 'PRODUCT' && (i.stock ?? 0) <= 5)
  );

  ngOnInit(): void {
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
}
