import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../services/product';

declare var $: any;

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class ProductsComponent implements OnInit {

  products: Product[] = [];

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.productService.getProducts().subscribe({
      next: (response) => {

        this.products = response;

        this.cdr.detectChanges();

        setTimeout(() => {

          if ($.fn.DataTable.isDataTable('#productsTable')) {
            $('#productsTable').DataTable().destroy();
          }

          $('#productsTable').DataTable({
            pageLength: 5,
            responsive: true,
            columnDefs: [
                {
                    targets: [0], // Id column
                    visible: false,
                    searchable: false
                }
            ]
        });

        }, 100);

      },
      error: (error) => {
        console.error(error);
      }
    });

  }
}