// alert-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AlertModalData {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal fade show" 
         [class.d-block]="show" 
         [class.d-none]="!show"
         tabindex="-1" 
         role="dialog" 
         [attr.aria-hidden]="!show">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header border-0">
            <div class="modal-icon text-center w-100">
              <i class="fas fa-exclamation-triangle" 
                 *ngIf="data.type === 'warning'"
                 [class]="getIconClass()"></i>
              <i class="fas fa-times-circle" 
                 *ngIf="data.type === 'error'"
                 [class]="getIconClass()"></i>
              <i class="fas fa-check-circle" 
                 *ngIf="data.type === 'success'"
                 [class]="getIconClass()"></i>
              <i class="fas fa-info-circle" 
                 *ngIf="data.type === 'info'"
                 [class]="getIconClass()"></i>
            </div>
          </div>
          
          <div class="modal-body text-center px-4 pb-4">
            <h5 class="modal-title mb-3" [class]="getTitleClass()">
              {{data.title}}
            </h5>
            <p class="mb-4 text-muted">{{data.message}}</p>
            
            <div class="d-flex gap-2 justify-content-center">
              <button type="button" 
                      class="btn btn-outline-secondary"
                      *ngIf="data.showCancel"
                      (click)="onCancel()">
                {{data.cancelText || 'Cancelar'}}
              </button>
              <button type="button" 
                      [class]="getButtonClass()"
                      (click)="onConfirm()">
                {{data.confirmText || 'Entendido'}}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Backdrop -->
    <div class="modal-backdrop fade show" 
         *ngIf="show"
         (click)="onConfirm()"></div>
  `,
  styles: [`
    .modal-icon {
      margin-bottom: 1rem;
    }
    
    .modal-icon i {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    .icon-warning {
      color: #ffc107;
    }
    
    .icon-error {
      color: #dc3545;
    }
    
    .icon-success {
      color: #28a745;
    }
    
    .icon-info {
      color: #17a2b8;
    }
    
    .title-warning {
      color: #856404;
    }
    
    .title-error {
      color: #721c24;
    }
    
    .title-success {
      color: #155724;
    }
    
    .title-info {
      color: #0c5460;
    }
    
    .modal-content {
      border: none;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    
    .modal-dialog {
      max-width: 400px;
    }
    
    .btn {
      padding: 8px 24px;
      border-radius: 25px;
      font-weight: 500;
    }
    
    .modal-backdrop {
      background-color: rgba(0, 0, 0, 0.5);
    }
  `]
})
export class AlertModalComponent {
  @Input() show: boolean = false;
  @Input() data: AlertModalData = {
    title: '',
    message: '',
    type: 'info'
  };
  
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  getIconClass(): string {
    return `icon-${this.data.type}`;
  }
  
  getTitleClass(): string {
    return `title-${this.data.type}`;
  }
  
  getButtonClass(): string {
    const buttonClasses = {
      warning: 'btn btn-warning',
      error: 'btn btn-danger',
      success: 'btn btn-success',
      info: 'btn btn-info'
    };
    return buttonClasses[this.data.type] || 'btn btn-primary';
  }
  
  onConfirm(): void {
    this.confirmed.emit();
    this.close();
  }
  
  onCancel(): void {
    this.cancelled.emit();
    this.close();
  }
  
  private close(): void {
    this.show = false;
    this.closed.emit();
  }
}