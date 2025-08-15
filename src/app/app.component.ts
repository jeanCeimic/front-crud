import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from './services/producto.service';
import { ProductoFormComponent } from './components/producto-form.component';
import { EstadisticasComponent } from './components/estadisticas.component';
import { BusquedaProductosComponent } from './components/busqueda-productos.component';
import { ProductosInactivosComponent } from './components/productos-inactivos.component';
import { Producto, ProductoCreateDto, ProductoUpdateDto } from './models/producto.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductoFormComponent,
    EstadisticasComponent,
    BusquedaProductosComponent,
    ProductosInactivosComponent
  ],
  template: `
    <div class="app-container">
      <header>
        <h1>🛍️ Gestión de Productos</h1>
        <nav>
          <button 
            [class.active]="vistaActual === 'productos'"
            (click)="cambiarVista('productos')"
          >
            📦 Productos
          </button>
          <button 
            [class.active]="vistaActual === 'estadisticas'"
            (click)="cambiarVista('estadisticas')"
          >
            📊 Estadísticas
          </button>
          <button 
            [class.active]="vistaActual === 'busqueda'"
            (click)="cambiarVista('busqueda')"
          >
            🔍 Búsqueda Avanzada
          </button>
          <button 
            [class.active]="vistaActual === 'inactivos'"
            (click)="cambiarVista('inactivos')"
          >
            🗑️ Productos Inactivos
          </button>
        </nav>
      </header>

      <main>
        <!-- Vista de Productos -->
        <div *ngIf="vistaActual === 'productos'" class="productos-section">
          <!-- Formulario -->
          <app-producto-form
            *ngIf="showForm"
            [producto]="productoEditando"
            (save)="guardarProducto($event)"
            (cancel)="cancelarEdicion()"
          ></app-producto-form>

          <!-- Botones de acción -->
          <div class="actions-container" *ngIf="!showForm">
            <button (click)="mostrarFormulario()" class="btn-add">
              ➕ Agregar Producto
            </button>
            <button (click)="cargarProductos()" class="btn-refresh" [class.rotating]="loading">
              ⟳ Actualizar Lista
            </button>
          </div>

          <!-- Lista de productos -->
          <div class="productos-container">
            <div class="loading" *ngIf="loading">
              🔄 Cargando productos...
            </div>

            <div class="error" *ngIf="error">
              ❌ {{ error }}
            </div>

            <div class="productos-grid" *ngIf="!loading && !error">
              <div class="producto-card" *ngFor="let producto of productos">
                <div class="producto-header">
                  <h3>{{ producto.nombre }}</h3>
                  <div class="precio">\${{ producto.precio | number:'1.2-2' }}</div>
                </div>
                
                <div class="producto-body">
                  <p class="descripcion">{{ producto.descripcion || 'Sin descripción' }}</p>
                  <small class="fecha">
                    Creado: {{ producto.fechaCreacion | date:'short' }}
                  </small>
                </div>

                <div class="producto-actions">
                  <button (click)="editarProducto(producto)" class="btn-edit">
                    ✏️ Editar
                  </button>
                  <button (click)="eliminarProducto(producto.id)" class="btn-delete">
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>

            <div class="no-productos" *ngIf="!loading && !error && productos.length === 0">
              📦 No hay productos disponibles
            </div>
          </div>
        </div>

        <!-- Vista de Estadísticas -->
        <app-estadisticas *ngIf="vistaActual === 'estadisticas'">
        </app-estadisticas>

        <!-- Vista de Búsqueda Avanzada -->
        <app-busqueda-productos *ngIf="vistaActual === 'busqueda'">
        </app-busqueda-productos>

        <!-- Vista de Productos Inactivos -->
        <app-productos-inactivos *ngIf="vistaActual === 'inactivos'">
        </app-productos-inactivos>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    header {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }

    header h1 {
      color: white;
      font-size: 2.5rem;
      font-weight: 300;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      margin-bottom: 20px;
    }

    nav {
      display: flex;
      justify-content: center;
      gap: 15px;
      flex-wrap: wrap;
    }

    nav button {
      padding: 10px 20px;
      border: none;
      border-radius: 25px;
      background: rgba(255,255,255,0.2);
      color: white;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
      backdrop-filter: blur(5px);
    }

    nav button.active {
      background: rgba(255,255,255,0.3);
      box-shadow: 0 0 15px rgba(255,255,255,0.2);
    }

    nav button:hover:not(.active) {
      background: rgba(255,255,255,0.25);
    }

    main {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .productos-section {
      background: rgba(255,255,255,0.95);
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .actions-container {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .btn-add {
      background: linear-gradient(45deg, #2ecc71, #27ae60);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 25px;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
      transition: all 0.3s ease;
    }

    .btn-add:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
    }

    .btn-refresh {
      background: linear-gradient(45deg, #3498db, #2980b9);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 25px;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-refresh:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
    }

    .rotating {
      animation: rotate 1s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .productos-container {
      min-height: 200px;
    }

    .loading, .error, .no-productos {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 10px;
      font-size: 18px;
    }

    .error {
      color: #e74c3c;
      background: rgba(231, 76, 60, 0.1);
    }

    .productos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .producto-card {
      background: white;
      border-radius: 15px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .producto-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0,0,0,0.15);
    }

    .producto-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 15px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }

    .producto-header h3 {
      color: #2c3e50;
      font-size: 1.3rem;
      margin: 0;
    }

    .precio {
      background: linear-gradient(45deg, #3498db, #2980b9);
      color: white;
      padding: 5px 12px;
      border-radius: 15px;
      font-weight: bold;
    }

    .descripcion {
      color: #666;
      margin-bottom: 10px;
    }

    .fecha {
      color: #95a5a6;
      font-size: 12px;
    }

    .producto-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 15px;
    }

    .btn-edit, .btn-delete {
      padding: 8px 15px;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .btn-edit {
      background: #f39c12;
      color: white;
    }

    .btn-delete {
      background: #e74c3c;
      color: white;
    }

    .btn-edit:hover {
      background: #e67e22;
    }

    .btn-delete:hover {
      background: #c0392b;
    }

    @media (max-width: 768px) {
      nav {
        flex-direction: column;
        padding: 0 20px;
      }

      .productos-grid {
        grid-template-columns: 1fr;
      }

      .productos-section {
        padding: 10px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  vistaActual: 'productos' | 'estadisticas' | 'busqueda' | 'inactivos' = 'productos';
  productos: Producto[] = [];
  productoEditando: Producto | null = null;
  showForm = false;
  loading = false;
  error = '';
  searchTerm = '';
  estadisticas: any = null;

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarEstadisticas();
  }

  cargarProductos() {
    this.loading = true;
    this.error = '';
    
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar productos. Verifica que la API esté ejecutándose.';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  cargarEstadisticas() {
    this.productoService.getEstadisticas().subscribe({
      next: (stats) => {
        this.estadisticas = stats;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  mostrarFormulario() {
    this.showForm = true;
    this.productoEditando = null;
  }

  editarProducto(producto: Producto) {
    this.productoEditando = producto;
    this.showForm = true;
  }

  guardarProducto(producto: ProductoCreateDto | (ProductoUpdateDto & { id: number })) {
    if ('id' in producto) {
      // Es una actualización
      const { id, ...updateDto } = producto;
      this.productoService.updateProducto(id, updateDto).subscribe({
        next: () => {
          this.cargarProductos();
          this.cargarEstadisticas();
          this.cancelarEdicion();
        },
        error: (error) => {
          this.error = 'Error al actualizar el producto';
          console.error('Error:', error);
        }
      });
    } else {
      // Es una creación
      this.productoService.createProducto(producto).subscribe({
        next: () => {
          this.cargarProductos();
          this.cargarEstadisticas();
          this.cancelarEdicion();
        },
        error: (error) => {
          this.error = 'Error al crear el producto';
          console.error('Error:', error);
        }
      });
    }
  }

  eliminarProducto(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productoService.deleteProducto(id).subscribe({
        next: () => {
          this.cargarProductos();
          this.cargarEstadisticas();
        },
        error: (error) => {
          this.error = 'Error al eliminar el producto';
          console.error('Error:', error);
        }
      });
    }
  }

  cambiarVista(vista: 'productos' | 'estadisticas' | 'busqueda' | 'inactivos') {
    this.vistaActual = vista;
    if (vista === 'productos') {
      this.cargarProductos();
    }
  }

  cancelarEdicion() {
    this.showForm = false;
    this.productoEditando = null;
  }
}