import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:82/api/';

  ProductId: number = 0;

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl + 'Products');
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(this.apiUrl + 'Products/' + id);
  }

  createProduct(product: Product): Observable<Product> {

    return this.http.post<Product>(
      this.apiUrl + 'Products',
      product
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(this.apiUrl + 'Products/' + id);
  }

  updateProduct(product: Product): Observable<void> {

    return this.http.put<void>(
      this.apiUrl + 'Products/' + product.id,
      product
    );

  }
}