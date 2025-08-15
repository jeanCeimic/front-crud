// Interface para productos que vienen del backend
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  fechaCreacion: string;
  activo: boolean;
}

// DTO para crear nuevos productos
export interface ProductoCreateDto {
  nombre: string;
  descripcion: string;
  precio: number;
}

// DTO para actualizar productos existentes
export interface ProductoUpdateDto {
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
}

export interface EstadisticasProducto {
  totalProductos: number;
  productosActivos: number;
  productosInactivos: number;
  precioPromedio: number;
  precioMinimo: number;
  precioMaximo: number;
  productoMasCaro: { nombre: string; precio: number } | null;
  productoMasBarato: { nombre: string; precio: number } | null;
}