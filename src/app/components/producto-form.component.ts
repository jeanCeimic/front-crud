import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Producto, ProductoCreateDto, ProductoUpdateDto } from '../models/producto.model';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <h3>{{ producto ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
      <form [formGroup]="productoForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="nombre">Nombre:</label>
          <input 
            type="text" 
            id="nombre" 
            formControlName="nombre"
            [class.error]="productoForm.get('nombre')?.invalid && productoForm.get('nombre')?.touched"
          >
          <div class="error-message" *ngIf="productoForm.get('nombre')?.invalid && productoForm.get('nombre')?.touched">
            El nombre es requerido
          </div>
        </div>

        <div class="form-group">
          <label for="descripcion">Descripción:</label>
          <textarea 
            id="descripcion" 
            formControlName="descripcion"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="precio">Precio:</label>
          <input 
            type="number" 
            id="precio" 
            formControlName="precio"
            step="0.01"
            min="0"
            [class.error]="productoForm.get('precio')?.invalid && productoForm.get('precio')?.touched"
          >
          <div class="error-message" *ngIf="productoForm.get('precio')?.invalid && productoForm.get('precio')?.touched">
            El precio debe ser mayor a 0
          </div>
        </div>

        <div class="form-check" *ngIf="producto">
          <label>
            <input type="checkbox" formControlName="activo"> Producto activo
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" [disabled]="productoForm.invalid" class="btn-primary">
            {{ producto ? 'Actualizar' : 'Crear' }}
          </button>
          <button type="button" (click)="onCancel()" class="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
      color: #333;
    }

    input, textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    input.error, textarea.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 5px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .btn-primary, .btn-secondary {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-primary {
      background-color: #3498db;
      color: white;
    }

    .btn-primary:disabled {
      background-color: #bdc3c7;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #95a5a6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2980b9;
    }

    .btn-secondary:hover {
      background-color: #7f8c8d;
    }
  `]
})
export class ProductoFormComponent implements OnChanges {
  @Input() producto: Producto | null = null;
  @Output() save = new EventEmitter<ProductoCreateDto | (ProductoUpdateDto & { id: number })>();
  @Output() cancel = new EventEmitter<void>();

  productoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      activo: [true]
    });
  }

  ngOnChanges() {
    if (this.producto) {
      this.productoForm.patchValue({
        nombre: this.producto.nombre,
        descripcion: this.producto.descripcion,
        precio: this.producto.precio
      });
    }
  }

  onSubmit() {
    if (this.productoForm.valid) {
      const formValue = this.productoForm.value;
      
      if (this.producto) {
        // Si estamos editando, emitimos un ProductoUpdateDto
        const updateDto: ProductoUpdateDto = {
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
          precio: formValue.precio,
          activo: formValue.activo
        };
        this.save.emit({ id: this.producto.id, ...updateDto });
      } else {
        // Si estamos creando, emitimos un ProductoCreateDto
        const createDto: ProductoCreateDto = {
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
          precio: formValue.precio
        };
        this.save.emit(createDto);
      }
      
      this.productoForm.reset();
    }
  }

  onCancel() {
    this.productoForm.reset();
    this.cancel.emit();
  }
}
