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
    this.loadProducts();
  }

  private loadProducts(): void {

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

            order: [[1, 'asc']], // Sort by Id ascending

            columnDefs: [
              {
                targets: [0], // Id column
                visible: false,
                searchable: false
              },
              {
                targets: '_all',
                className: 'dt-center'
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

  addProduct(): void {
    
  }

  editProduct(id: number): void {

    console.log('Edit Product Id:', id);

    // Later:
    // this.router.navigate(['/products/edit', id]);
  }

  deleteProduct(id: number): void {

    const confirmDelete = confirm(
      'Are you sure you want to delete this product?'
    );

    if (confirmDelete) {

      console.log('Delete Product Id:', id);

      // Later:
      // this.productService.deleteProduct(id)
      //   .subscribe(() => {
      //      this.loadProducts();
      //   });
    }
  }
}