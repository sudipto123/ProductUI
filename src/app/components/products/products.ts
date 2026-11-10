import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../services/product';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms';


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

  newProduct: Product = {
    id: 0,
    name: '',
    price: 0,
    description: ''
  };

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

        this.products = [...response];

        this.cdr.detectChanges();

        this.rebuildTable(this.products);

      },

      error: (error) => {

        console.error(error);

      }

    });

  }

  private rebuildTable(products: Product[]): void {

    console.log('Products passed to DataTable:', products);

    this.cdr.detectChanges();

    setTimeout(() => {

      if ($.fn.DataTable.isDataTable('#productsTable')) {
        $('#productsTable').DataTable().destroy();
      }

      this.cdr.detectChanges();

      setTimeout(() => {

        console.log(
          'Rows currently rendered:',
          $('#productsTable tbody tr').length
        );

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

      }, 500);

    }, 500);

  }

  addProduct(productForm: NgForm): void {

    this.productService
      .createProduct(this.newProduct)
      .subscribe({

        next: (response) => {

          // Add new product to the array
          //this.products.push(response);

          this.products = [...this.products, response];

          console.log('After Push:', this.products);

          this.cdr.detectChanges();

          // Refresh table using latest array
          this.rebuildTable(this.products);

          // Close modal
          const modalElement =
            document.getElementById('addProductModal');

          if (modalElement) {

            const modal =
              (window as any).bootstrap.Modal.getInstance(
                modalElement
              );

            modal?.hide();
          }

          // Reset model
          this.newProduct = {
            id: 0,
            name: '',
            price: 0,
            description: ''
          };

          // Reset validation state
          productForm.resetForm();

        },

        error: (error) => {

          console.error(
            'Error Creating Product:',
            error
          );

        }

      });

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
          // else{
          //   this.loadProducts();
          // }

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

  convertToUpperCase(field: 'name' | 'description'): void {

    if (this.newProduct[field]) {
      this.newProduct[field] =
        this.newProduct[field].toUpperCase();
    }

  }

}