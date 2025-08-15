import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductoService } from '../services/producto.service';
import { Producto } from '../models/producto.model';

@Component({
  selector: 'app-busqueda-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="busqueda-container">
      <h2>Búsqueda Avanzada</h2>
      <form [formGroup]="busquedaForm" (ngSubmit)="buscar()">
        <div class="form-group">
          <label for="nombre">Nombre o descripción:</label>
          <input type="text" id="nombre" formControlName="nombre" 
                 [class.error]="error && !busquedaForm.value.nombre && 
                               !busquedaForm.value.precioMin && 
                               !busquedaForm.value.precioMax">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="precioMin">Precio mínimo:</label>
            <input type="number" id="precioMin" formControlName="precioMin" 
                   min="0" step="0.01" 
                   [class.error]="error && busquedaForm.value.precioMin < 0">
          </div>

          <div class="form-group">
            <label for="precioMax">Precio máximo:</label>
            <input type="number" id="precioMax" formControlName="precioMax" 
                   min="0" step="0.01"
                   [class.error]="error && busquedaForm.value.precioMax < 0">
          </div>
        </div>

        <div class="form-check">
          <input type="checkbox" id="incluirInactivos" formControlName="incluirInactivos">
          <label for="incluirInactivos">Incluir productos inactivos</label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-buscar" [disabled]="loading">
            <span *ngIf="!loading">🔍 Buscar</span>
            <span *ngIf="loading">⌛ Buscando...</span>
          </button>
          <button type="button" class="btn-limpiar" (click)="limpiarBusqueda()" [disabled]="loading">
            ↻ Limpiar
          </button>
        </div>
      </form>

      <div *ngIf="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Buscando productos...</p>
      </div>

      <div class="resultados" *ngIf="!loading && !error && productos.length > 0">
        <h3>Resultados ({{ productos.length }})</h3>
        <div class="productos-grid">
          <div *ngFor="let producto of productos" class="producto-card" [class.inactivo]="!producto.activo">
            <div class="producto-header">
              <h4>{{ producto.nombre }}</h4>
              <span class="estado-badge" [class.inactivo]="!producto.activo">
                {{ producto.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <p class="descripcion">{{ producto.descripcion }}</p>
            <p class="precio">{{ producto.precio | currency }}</p>
            <p class="fecha">Creado: {{ producto.fechaCreacion | date:'short' }}</p>
          </div>
        </div>
      </div>
      
      <div class="no-resultados" *ngIf="!loading && !error && busquedaRealizada && productos.length === 0">
        <p>📭 No se encontraron productos con los criterios especificados.</p>
        <button class="btn-limpiar" (click)="limpiarBusqueda()">
          Limpiar búsqueda
        </button>
      </div>
    </div>
  `,
  styles: [`
    .busqueda-container {
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      color: #333;
      font-weight: 500;
    }

    input[type="text"],
    input[type="number"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    input[type="text"]:focus,
    input[type="number"]:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    input.error {
      border-color: #e74c3c;
      background-color: #fef5f5;
    }

    .form-check {
      margin: 15px 0;
      display: flex;
      align-items: center;
    }

    .form-check input {
      margin-right: 8px;
      width: 16px;
      height: 16px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .btn-buscar, .btn-limpiar {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-buscar {
      background-color: #3498db;
      color: white;
    }

    .btn-limpiar {
      background-color: #95a5a6;
      color: white;
    }

    .btn-buscar:hover:not(:disabled) {
      background-color: #2980b9;
    }

    .btn-limpiar:hover:not(:disabled) {
      background-color: #7f8c8d;
    }

    .btn-buscar:disabled, .btn-limpiar:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .loading {
      text-align: center;
      padding: 40px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 20px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      background-color: #fef5f5;
      color: #e74c3c;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .productos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .producto-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .producto-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .producto-card.inactivo {
      opacity: 0.8;
      background: #f8f9fa;
    }

    .producto-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 15px;
      gap: 10px;
    }

    .producto-header h4 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.1rem;
    }

    .estado-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      background: #2ecc71;
      color: white;
    }

    .estado-badge.inactivo {
      background: #95a5a6;
    }

    .descripcion {
      color: #666;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .precio {
      font-size: 20px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    .fecha {
      color: #95a5a6;
      font-size: 12px;
    }

    .no-resultados {
      text-align: center;
      padding: 40px;
      background: #f8f9fa;
      border-radius: 8px;
      color: #666;
    }

    .no-resultados button {
      margin-top: 15px;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 15px;
      }

      .form-actions {
        flex-direction: column;
      }

      .productos-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BusquedaProductosComponent implements OnInit {
  busquedaForm: FormGroup;
  productos: Producto[] = [];
  busquedaRealizada = false;
  loading = false;
  error: string | null = null;
  lastSearch: any = null;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService
  ) {
    this.busquedaForm = this.fb.group({
      nombre: [''],
      precioMin: [null],
      precioMax: [null],
      incluirInactivos: [false]
    });
  }

  ngOnInit() {}

  validarCriterios(valores: any): string | null {
    if (valores.precioMin && valores.precioMax && 
        Number(valores.precioMin) > Number(valores.precioMax)) {
      return 'El precio mínimo no puede ser mayor que el precio máximo';
    }
    if (valores.precioMin && Number(valores.precioMin) < 0) {
      return 'El precio mínimo no puede ser negativo';
    }
    if (valores.precioMax && Number(valores.precioMax) < 0) {
      return 'El precio máximo no puede ser negativo';
    }
    return null;
  }

  buscar() {
    this.error = null;
    const valores = this.busquedaForm.value;
    
    // Validar que al menos un criterio de búsqueda esté presente
    if (!valores.nombre && !valores.precioMin && !valores.precioMax && !valores.incluirInactivos) {
      this.error = 'Por favor, especifica al menos un criterio de búsqueda';
      return;
    }

    // Validar los criterios
    const errorValidacion = this.validarCriterios(valores);
    if (errorValidacion) {
      this.error = errorValidacion;
      return;
    }

    // Evitar búsquedas duplicadas
    const searchString = JSON.stringify(valores);
    if (searchString === this.lastSearch) {
      return;
    }
    this.lastSearch = searchString;

    this.loading = true;
    this.busquedaRealizada = true;
    
    this.productoService.buscarProductos({
      nombre: valores.nombre,
      precioMin: valores.precioMin,
      precioMax: valores.precioMax,
      incluirInactivos: valores.incluirInactivos
    }).subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
        this.error = null;
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error en la conexión con el servidor. Por favor, intenta de nuevo más tarde.';
        if (error.status === 504 || error.name === 'TimeoutError') {
          this.error = 'La conexión con el servidor ha tardado demasiado. Por favor, intenta de nuevo.';
        }
        console.error('Error en la búsqueda:', error);
      }
    });
  }

  limpiarBusqueda() {
    this.busquedaForm.reset({
      nombre: '',
      precioMin: null,
      precioMax: null,
      incluirInactivos: false
    });
    this.productos = [];
    this.busquedaRealizada = false;
    this.error = null;
    this.lastSearch = null;
  }
}
