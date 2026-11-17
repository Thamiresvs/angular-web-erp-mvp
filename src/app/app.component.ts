import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="flex min-h-screen bg-slate-50">
      <app-sidebar />
      <main class="flex-1 p-8 overflow-y-auto">
        <router-outlet />
      </main>
    </div>
  `
})
export class AppComponent {}
