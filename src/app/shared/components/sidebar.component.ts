import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 bg-slate-900 text-slate-100 min-h-screen p-5 flex flex-col justify-between">
      <div>
        <div class="mb-8">
          <span class="text-xs uppercase tracking-widest text-indigo-400 font-bold">Modular ERP</span>
          <h2 class="text-xl font-bold text-white">GestãoPro MVP</h2>
        </div>

        <nav class="space-y-2 text-sm">
          <a routerLink="/dashboard" routerLinkActive="bg-indigo-600 text-white"
             class="block px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition">
            Dashboard
          </a>
          <a routerLink="/orders" routerLinkActive="bg-indigo-600 text-white"
             class="block px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition">
            Vendas & OS
          </a>
          <a routerLink="/catalog" routerLinkActive="bg-indigo-600 text-white"
             class="block px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition">
            Produtos & Serviços
          </a>
          <a routerLink="/customers" routerLinkActive="bg-indigo-600 text-white"
             class="block px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition">
            Clientes
          </a>
        </nav>
      </div>

      <div class="text-xs text-slate-500 border-t border-slate-800 pt-4">
        Angular + TypeScript + REST API
      </div>
    </aside>
  `
})
export class SidebarComponent {}
