import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CatalogItem } from '../../core/models/erp.models';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <div class="space-y-6">
      <header class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Catálogo de Produtos & Serviços</h1>
          <p class="text-sm text-slate-500">Gerencie itens comercializados, preços e controle de estoque</p>
        </div>
      </header>

      <!-- Form -->
      <form (ngSubmit)="addItem()" class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">SKU / Código</label>
          <input [(ngModel)]="form.sku" name="sku" required placeholder="PRD-003" class="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-slate-600 mb-1">Descrição</label>
          <input [(ngModel)]="form.name" name="name" required placeholder="Nome do produto ou serviço" class="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
          <select [(ngModel)]="form.type" name="type" class="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="PRODUCT">Produto</option>
            <option value="SERVICE">Serviço</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Preço (R$)</label>
          <input type="number" [(ngModel)]="form.price" name="price" required min="1" class="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          @if (form.type === 'PRODUCT') {
            <label class="block text-xs font-medium text-slate-600 mb-1">Estoque Inicial</label>
            <input type="number" [(ngModel)]="form.stock" name="stock" min="0" class="w-full px-3 py-2 border rounded-lg text-sm" />
          } @else {
            <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition">
              + Adicionar
            </button>
          }
        </div>
        @if (form.type === 'PRODUCT') {
          <div class="md:col-span-6 flex justify-end">
            <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition">
              + Cadastrar Produto
            </button>
          </div>
        }
      </form>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th class="p-4">SKU</th>
              <th class="p-4">Item</th>
              <th class="p-4">Categoria</th>
              <th class="p-4">Preço Unitário</th>
              <th class="p-4">Estoque</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            @for (item of items(); track item.id) {
              <tr class="hover:bg-slate-50">
                <td class="p-4 font-mono text-xs text-slate-500">{{ item.sku }}</td>
                <td class="p-4 font-medium text-slate-800">{{ item.name }}</td>
                <td class="p-4">
                  <span class="px-2 py-1 text-xs rounded-full font-medium"
                    [ngClass]="item.type === 'PRODUCT' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'">
                    {{ item.type === 'PRODUCT' ? 'Produto' : 'Serviço' }}
                  </span>
                </td>
                <td class="p-4 font-semibold text-slate-700">{{ item.price | currency:'BRL' }}</td>
                <td class="p-4">
                  @if (item.type === 'PRODUCT') {
                    <div class="flex items-center gap-2">
                      <span class="font-medium">{{ item.stock }} un.</span>
                      <button (click)="adjustStock(item, 1)" class="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-xs font-bold">+</button>
                    </div>
                  } @else {
                    <span class="text-slate-400 text-xs">N/A (Serviço)</span>
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
export class CatalogComponent implements OnInit {
  private api = inject(ApiService);
  items = signal<CatalogItem[]>([]);

  form: CatalogItem = { sku: '', name: '', type: 'PRODUCT', price: 0, stock: 10 };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getCatalog().subscribe(data => this.items.set(data));
  }

  addItem(): void {
    if (!this.form.name || !this.form.sku) return;
    const payload: CatalogItem = {
      ...this.form,
      stock: this.form.type === 'SERVICE' ? null : (this.form.stock ?? 0)
    };
    this.api.createCatalogItem(payload).subscribe(() => {
      this.form = { sku: '', name: '', type: 'PRODUCT', price: 0, stock: 10 };
      this.load();
    });
  }

  adjustStock(item: CatalogItem, delta: number): void {
    if (!item.id || item.stock === null) return;
    this.api.updateStock(item.id, item.stock + delta).subscribe(() => this.load());
  }
}
