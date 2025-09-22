import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShoppingListComponent } from './components/shopping-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ShoppingListComponent],
  template: `
    <h1>{{ title }}</h1>
    <app-shopping-list></app-shopping-list>
    <router-outlet></router-outlet>
  `,
  styleUrl: './app.css',
})
export class AppComponent {
  title = 'Shopping List App';
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ShoppingListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('shopping-list');
}
