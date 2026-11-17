import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Customer } from '../../core/models/erp.models';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <header>
        <h1 class="text-2xl font-bold text-slate-800">Carteira de Clientes</h1>
        <p class="text-sm text-slate-500">Cadastro comercial de empresas e tomadores de serviço</p>
      </header>

      <form (ngSubmit)="addCustomer()" class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Razão Social / Nome</label>
          <input [(ngModel)]="form.name" name="name" required class="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">CPF / CNPJ</label>
          <input [(ngModel)]="form.document" name="document" required class="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">E-mail</label>
          <input [(ngModel)]="form.email" name="email" type="email" required class="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Segmento</label>
          <select [(ngModel)]="form.segment" name="segment" class="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="Comércio">Comércio</option>
            <option value="Serviços">Serviços</option>
          </select>
        </div>
        <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition">
          + Salvar Cliente
        </button>
      </form>

      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th class="p-4">Cliente</th>
              <th class="p-4">Documento</th>
              <th class="p-4">E-mail</th>
              <th class="p-4">Segmento</th>
              <th class="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            @for (c of customers(); track c.id) {
              <tr class="hover:bg-slate-50">
                <td class="p-4 font-medium text-slate-800">{{ c.name }}</td>
                <td class="p-4 text-slate-600">{{ c.document }}</td>
                <td class="p-4 text-slate-600">{{ c.email }}</td>
                <td class="p-4">
                  <span class="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700 font-medium">{{ c.segment }}</span>
                </td>
                <td class="p-4 text-right">
                  <button (click)="remove(c.id)" class="text-rose-600 hover:underline text-xs font-medium">Excluir</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class CustomersComponent implements OnInit {
  private api = inject(ApiService);
  customers = signal<Customer[]>([]);
  form: Customer = { name: '', document: '', email: '', phone: '', segment: 'Comércio' };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getCustomers().subscribe(data => this.customers.set(data));
  }

  addCustomer(): void {
    if (!this.form.name) return;
    this.api.createCustomer(this.form).subscribe(() => {
      this.form = { name: '', document: '', email: '', phone: '', segment: 'Comércio' };
      this.load();
    });
  }

  remove(id?: string): void {
    if (!id) return;
    this.api.deleteCustomer(id).subscribe(() => this.load());
  }
}
