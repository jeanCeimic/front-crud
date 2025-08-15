import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../services/producto.service';
import { Subscription } from 'rxjs';
import { EstadisticasProducto } from '../models/producto.model';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="estadisticas-container">
      <div class="header">
        <h2>Estadísticas de Productos</h2>
        <button class="btn-refresh" (click)="recargarEstadisticas()" [disabled]="loading">
          <span class="icon" [class.rotating]="loading">⟳</span>
          Actualizar
        </button>
      </div>

      <div *ngIf="error" class="error-message">
        <span class="icon">⚠️</span>
        <p>{{ error }}</p>
        <button class="btn-retry" (click)="recargarEstadisticas()">Reintentar</button>
      </div>

      <div [class.content-blur]="loading">
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Productos</h3>
            <p>{{ estadisticas?.totalProductos || 0 }}</p>
          </div>
          <div class="stat-card">
            <h3>Total Inactivos</h3>
            <p>{{ estadisticas?.productosInactivos || 0 }}</p>
          </div>
          <div class="stat-card">
            <h3>Precio Promedio</h3>
            <p>\${{ estadisticas?.precioPromedio?.toFixed(2) || '0.00' }}</p>
          </div>
          <div class="stat-card">
            <h3>Precio Mínimo</h3>
            <p>\${{ estadisticas?.precioMinimo?.toFixed(2) || '0.00' }}</p>
          </div>
          <div class="stat-card">
            <h3>Precio Máximo</h3>
            <p>\${{ estadisticas?.precioMaximo?.toFixed(2) || '0.00' }}</p>
          </div>
        </div>

        <div class="productos-destacados">
          <div *ngIf="estadisticas?.productoMasCaro" class="destacado destacado-max">
            <h3>Producto más caro</h3>
            <p>{{ estadisticas?.productoMasCaro?.nombre }} - \${{ estadisticas?.productoMasCaro?.precio }}</p>
          </div>
          <div *ngIf="estadisticas?.productoMasBarato" class="destacado destacado-min">
            <h3>Producto más barato</h3>
            <p>{{ estadisticas?.productoMasBarato?.nombre }} - \${{ estadisticas?.productoMasBarato?.precio }}</p>
          </div>
        </div>

        <div *ngIf="!estadisticas?.totalProductos" class="no-data">
          <p>No hay productos registrados</p>
          <small>Agrega algunos productos para ver las estadísticas</small>
        </div>
      </div>

      <div *ngIf="loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    </div>
  `,
  styles: [`
    .estadisticas-container {
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f0f2f5;
    }

    .header h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .btn-refresh {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      background: #3498db;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-refresh:hover:not(:disabled) {
      background: #2980b9;
    }

    .btn-refresh:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-refresh .icon {
      font-size: 18px;
      display: inline-block;
    }

    .rotating {
      animation: rotate 1s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 15px;
    }

    .content-blur {
      filter: blur(2px);
      pointer-events: none;
    }

    .error-message {
      background: #fee2e2;
      border: 1px solid #ef4444;
      color: #991b1b;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .error-message .icon {
      font-size: 24px;
    }

    .error-message p {
      margin: 0;
      flex-grow: 1;
    }

    .btn-retry {
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      background: #dc2626;
      color: white;
      cursor: pointer;
    }

    .btn-retry:hover {
      background: #b91c1c;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      transition: all 0.3s ease;
      border: 1px solid #e9ecef;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .stat-card h3 {
      margin: 0;
      font-size: 16px;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .stat-card p {
      margin: 15px 0 0;
      font-size: 28px;
      font-weight: bold;
      color: #2c3e50;
    }

    .productos-destacados {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .destacado {
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      transition: all 0.3s ease;
    }

    .destacado-max {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
    }

    .destacado-min {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .destacado h3 {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .destacado p {
      margin: 12px 0 0;
      font-size: 20px;
      font-weight: 500;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      background: #f8f9fa;
      border-radius: 10px;
      margin-top: 20px;
    }

    .no-data p {
      margin: 0 0 8px;
      font-size: 18px;
      color: #666;
    }

    .no-data small {
      color: #999;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .productos-destacados {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EstadisticasComponent implements OnInit {
  estadisticas: EstadisticasProducto | null = null;
  loading = false;
  error: string | null = null;
  refreshInterval: any;
  private subscription: Subscription | null = null;

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.cargarEstadisticas();
    // Actualizar cada 30 segundos
    this.refreshInterval = setInterval(() => this.cargarEstadisticas(false), 30000);

    // Suscribirse a los cambios en productos
    this.subscription = this.productoService.productosActualizados$
      .subscribe(() => this.cargarEstadisticas(false));
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  recargarEstadisticas() {
    this.cargarEstadisticas(true);
  }

  cargarEstadisticas(mostrarLoading = true) {
    if (mostrarLoading) {
      this.loading = true;
    }
    this.error = null;

    this.productoService.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;

        console.log(this.estadisticas)
        this.loading = false;
        this.error = null;
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 500) {
          this.error = 'Error interno del servidor. Por favor, intenta de nuevo más tarde.';
        } else if (error.status === 0) {
          this.error = 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else {
          this.error = 'Error al cargar las estadísticas. Por favor, intenta de nuevo.';
        }
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }
}
