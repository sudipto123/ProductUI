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

  private dataTable: any;

  isEditMode: boolean = false;

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

        // Initialize DataTable after Angular renders the data
        setTimeout(() => {

          if ($.fn.DataTable.isDataTable('#productsTable')) {

            this.dataTable = $('#productsTable').DataTable();

            this.dataTable.clear();
            this.dataTable.rows.add(this.products);
            this.dataTable.draw();

          } else {

            this.initializeDataTable();

          }

        }, 0);

      },

      error: (error) => {

        console.error('Error Loading Products:', error);

      }

    });

  }

  private initializeDataTable(): void {

    this.dataTable = $('#productsTable').DataTable({

      data: this.products,

      columns: [

        { data: 'id' },

        { data: 'name' },

        {
          data: 'price',
          render: (data: number) => {
            return '₹' + Number(data).toLocaleString('en-IN');
          }
        },

        { data: 'description' },

        {
          data: null,
          orderable: false,
          searchable: false,

          render: (data: any, type: string, row: Product) => {

            return `
              <i
                class="fas fa-pen-to-square text-primary me-3 action-icon edit-product"
                title="Edit"
                data-id="${row.id}">
              </i>

              <i
                class="fas fa-trash text-danger action-icon delete-product"
                title="Delete"
                data-id="${row.id}"
                data-name="${this.escapeHtml(row.name)}"
                data-bs-toggle="modal"
                data-bs-target="#deleteModal">
              </i>
            `;

          }

        }

      ],

      pageLength: 5,
      responsive: true,
      ordering: true,
      searching: true,

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

    // Edit button click
    $('#productsTable tbody').on(
      'click',
      '.edit-product',
      (event: any) => {

        const id = Number($(event.currentTarget).attr('data-id'));

        this.editProduct(id);

      }
    );

    // Delete button click
    $('#productsTable tbody').on(
      'click',
      '.delete-product',
      (event: any) => {

        const id = Number(
          $(event.currentTarget).attr('data-id')
        );

        const productName = $(event.currentTarget).attr('data-name');

        this.deleteProduct(id, productName);

        // Update Angular view
        this.cdr.detectChanges();

      }
    );

  }

  private escapeHtml(value: string): string {

    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  }

  addProduct(productForm: NgForm): void {

    this.productService
      .createProduct(this.newProduct)
      .subscribe({

        next: (response) => {

          // Add new product to Angular array
          this.products = [...this.products, response];

          console.log('After Adding Product:', this.products);

          // Add new row directly to DataTable
          if (this.dataTable) {

            this.dataTable.row.add(response).draw(false);

          }

          // Close Bootstrap modal
          const modalElement =
            document.getElementById('addProductModal');

          if (modalElement) {

            const modal =
              (window as any).bootstrap.Modal.getInstance(
                modalElement
              );

            modal?.hide();

          }

          // Reset product model
          this.newProduct = {
            id: 0,
            name: '',
            price: 0,
            description: ''
          };

          // Reset form validation
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

    this.productService.getProductById(id).subscribe({

      next: (response) => {

        console.log('API Response:', response);

        this.newProduct = {
          id: response.id,
          name: response.name,
          price: response.price,
          description: response.description
        };

        this.isEditMode = true;

        // Trigger Angular change detection
        this.cdr.detectChanges();

        // Open Edit Modal
        const modalElement =
          document.getElementById('editProductModal');

        if (modalElement) {

          const modal =
            (window as any).bootstrap.Modal.getOrCreateInstance(
              modalElement
            );

          modal.show();

        }

      },

      error: (error) => {
        console.error('Error Fetching Product:', error);
      }

    });

  }

 deleteProduct(id: number, productName: string): void {

    this.selectedProductId = id;
    this.selectedProductName = productName;
    console.log(this.selectedProductId, this.selectedProductName);
  }

  confirmDelete(): void {

    this.productService
      .deleteProduct(this.selectedProductId)
      .subscribe({

        next: () => {

          // Remove product from Angular array
          this.products = this.products.filter(
            p => p.id !== this.selectedProductId
          );

          // Remove corresponding row from DataTable
          if (this.dataTable) {

            this.dataTable.rows(
              (index: number, data: Product) => {
                return data.id === this.selectedProductId;
              }
            ).remove().draw(false);

          }

          // Close Bootstrap modal
          const modalElement =
            document.getElementById('deleteModal');

          if (modalElement) {

            const modal =
              (window as any).bootstrap.Modal.getInstance(
                modalElement
              );

            modal?.hide();

          }

          // Reset selected product
          this.selectedProductId = 0;
          this.selectedProductName = '';

        },

        error: (error) => {

          console.error(
            'Error Deleting Product:',
            error
          );

        }

      });

  }

  updateProduct(productForm: NgForm): void {

    // Create a copy of the product being updated
    const updatedProduct: Product = {
      ...this.newProduct
    };

    this.productService
      .updateProduct(updatedProduct)
      .subscribe({

        next: () => {

          console.log('Product Updated Successfully:', updatedProduct);

          // Update Angular products array
          this.products = this.products.map(p =>
            p.id === updatedProduct.id ? updatedProduct : p
          );

          // Update existing DataTable row
          if (this.dataTable) {

            const row = this.dataTable.row(
              (index: number, data: Product) => {
                return data.id === updatedProduct.id;
              }
            );

            row.data(updatedProduct).draw(false);

          }

          // Close Edit Product Modal
          const modalElement =
            document.getElementById('editProductModal');

          if (modalElement) {

            const modal =
              (window as any).bootstrap.Modal.getInstance(
                modalElement
              );

            modal?.hide();

          }

          // Reset product model
          this.newProduct = {
            id: 0,
            name: '',
            price: 0,
            description: ''
          };

          this.isEditMode = false;

          // Reset form validation
          productForm.resetForm();

        },

        error: (error) => {

          console.error(
            'Error Updating Product:',
            error
          );

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