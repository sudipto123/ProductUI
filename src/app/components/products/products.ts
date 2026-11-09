import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../services/product';
import { FormsModule } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class ProductsComponent implements OnInit {

  products: Product[] = [];

  selectedProductId: number = 0;
  selectedProductName: string = '';

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
          destroy: true,
          pageLength: 5,
          responsive: true,
          order: [[1, 'asc']],
          columnDefs: [
            {
              targets: [0],
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

    const modalElement =
      document.getElementById('addProductModal');

    if (modalElement) {

      const modal =
        (window as any).bootstrap.Modal.getInstance(
          modalElement
        );

      modal?.hide();
    }

  }

  editProduct(id: number): void {

    console.log('Edit Product Id:', id);

    // Later:
    // this.router.navigate(['/products/edit', id]);
  }

 deleteProduct(id: number, productName: string): void {

    this.selectedProductId = id;
    this.selectedProductName = productName;

  }

  confirmDelete(): void {

    this.productService
      .deleteProduct(this.selectedProductId)
      .subscribe({

        next: () => {

          this.products = this.products.filter(
            p => p.id !== this.selectedProductId
          );

          this.cdr.detectChanges();

          const table = $('#productsTable').DataTable();

          if (this.products.length === 0) {

            table.clear().draw();

          }

          // Close modal
          const modalElement =
            document.getElementById('deleteModal');

          if (modalElement) {

            const modal =
              (window as any).bootstrap.Modal.getInstance(
                modalElement
              );

            modal?.hide();
          }

        },

        error: (error) => {

          console.error(error);

        }

      });

  }

}