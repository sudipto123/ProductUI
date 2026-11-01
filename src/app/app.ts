import { Component } from '@angular/core';
import { ProductsComponent } from './components/products/products';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProductsComponent],
  templateUrl: './app.html'
})
export class App {
}