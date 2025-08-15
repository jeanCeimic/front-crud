import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../services/producto.service';
import { Producto } from '../models/producto.model';

@Component({
  selector: 'app-productos-inactivos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inactivos-container">
      <h2>Productos Inactivos</h2>
      <div class="productos-grid" *ngIf="productos.length > 0; else noProductos">
        <div *ngFor="let producto of productos" class="producto-card">
          <h3>{{ producto.nombre }}</h3>
          <p class="descripcion">{{ producto.descripcion }}</p>
          <p class="precio">{{ producto.precio | currency }}</p>
          <p class="fecha">Creado: {{ producto.fechaCreacion | date }}</p>
          <div class="acciones">
            <button class="btn-restaurar" (click)="restaurarProducto(producto.id)">Restaurar</button>
            <button class="btn-eliminar" (click)="eliminarPermanente(producto.id)">Eliminar Permanente</button>
          </div>
        </div>
      </div>
      <ng-template #noProductos>
        <p class="no-productos">No hay productos inactivos</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .inactivos-container {
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .productos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .producto-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #dee2e6;
    }

    .producto-card h3 {
      margin: 0 0 10px;
      color: #2c3e50;
    }

    .descripcion {
      color: #666;
      margin-bottom: 10px;
    }

    .precio {
      font-size: 18px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .fecha {
      color: #999;
      font-size: 12px;
      margin-bottom: 15px;
    }

    .acciones {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .btn-restaurar, .btn-eliminar {
      padding: 8px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-restaurar {
      background-color: #2ecc71;
      color: white;
    }

    .btn-eliminar {
      background-color: #e74c3c;
      color: white;
    }

    .btn-restaurar:hover {
      background-color: #27ae60;
    }

    .btn-eliminar:hover {
      background-color: #c0392b;
    }

    .no-productos {
      text-align: center;
      color: #666;
      padding: 20px;
    }
  `]
})
export class ProductosInactivosComponent implements OnInit {
  productos: Producto[] = [];

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.cargarProductosInactivos();
  }

  cargarProductosInactivos() {
    this.productoService.getProductosInactivos().subscribe(
      data => this.productos = data,
      error => console.error('Error al cargar productos inactivos:', error)
    );
  }

  restaurarProducto(id: number) {
    this.productoService.restaurarProducto(id).subscribe(
      () => {
        this.productos = this.productos.filter(p => p.id !== id);
      },
      error => console.error('Error al restaurar producto:', error)
    );
  }

  eliminarPermanente(id: number) {
    if (confirm('¿Está seguro de eliminar permanentemente este producto? Esta acción no se puede deshacer.')) {
      this.productoService.deleteProductoPermanente(id).subscribe(
        () => {
          this.productos = this.productos.filter(p => p.id !== id);
        },
        error => console.error('Error al eliminar producto permanentemente:', error)
      );
    }
  }
}
