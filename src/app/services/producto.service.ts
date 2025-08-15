import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer, Subject } from 'rxjs';
import { retryWhen, delayWhen, take, catchError, tap } from 'rxjs/operators';
import { Producto, ProductoCreateDto, ProductoUpdateDto, EstadisticasProducto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:5244/api/productos';
  private maxRetries = 3;
  private retryDelay = 1000; // 1 segundo
  private productosActualizados = new Subject<void>();

  productosActualizados$ = this.productosActualizados.asObservable();

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error en la aplicación';
    
    if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor. Por favor, intenta de nuevo más tarde.';
    } else if (error.error && error.error.mensaje) {
      errorMessage = error.error.mensaje;
    }

    console.error('Error en ProductoService:', error);
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }

  private retryStrategy<T>(): (source: Observable<T>) => Observable<T> {
    return retryWhen(errors => 
      errors.pipe(
        delayWhen(() => timer(this.retryDelay)),
        take(this.maxRetries)
      )
    );
  }

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl)
      .pipe(
        this.retryStrategy(),
        catchError(this.handleError)
      );
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`)
      .pipe(
        this.retryStrategy(),
        catchError(this.handleError)
      );
  }

  createProducto(producto: ProductoCreateDto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto)
      .pipe(
        this.retryStrategy(),
        catchError(this.handleError),
        tap(() => this.productosActualizados.next())
      );
  }

  updateProducto(id: number, producto: ProductoUpdateDto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto)
      .pipe(
        this.retryStrategy(),
        catchError(this.handleError),
        tap(() => this.productosActualizados.next())
      );
  }

  deleteProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        this.retryStrategy(),
        catchError(this.handleError),
        tap(() => this.productosActualizados.next())
      );
  }

  deleteProductoPermanente(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/permanente`)
      .pipe(
        this.retryStrategy(),
        catchError(this.handleError)
      );
  }

  buscarProductos(params: {
    nombre?: string,
    precioMin?: number,
    precioMax?: number,
    incluirInactivos?: boolean
  }): Observable<Producto[]> {
    let httpParams = new HttpParams();
    if (params.nombre) httpParams = httpParams.set('nombre', params.nombre);
    if (params.precioMin) httpParams = httpParams.set('precioMin', params.precioMin);
    if (params.precioMax) httpParams = httpParams.set('precioMax', params.precioMax);
    if (params.incluirInactivos) httpParams = httpParams.set('incluirInactivos', params.incluirInactivos);
    
    return this.http.get<Producto[]>(`${this.apiUrl}/buscar`, { params: httpParams })
      .pipe(
        this.retryStrategy(),
        catchError(this.handleError)
      );
  }

  getEstadisticas(): Observable<EstadisticasProducto> {
    return this.http.get<EstadisticasProducto>(`${this.apiUrl}/estadisticas`)
      .pipe(
        this.retryStrategy(),
        catchError(this.handleError)
      );
  }

  getProductosInactivos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/inactivos`)
      .pipe(
        this.retryStrategy(),
        catchError(this.handleError)
      );
  }

  restaurarProducto(id: number): Observable<{ mensaje: string; producto: Producto }> {
    return this.http.put<{ mensaje: string; producto: Producto }>(`${this.apiUrl}/${id}/restaurar`, {})
      .pipe(
        this.retryStrategy(),
        catchError(this.handleError)
      );
  }
}