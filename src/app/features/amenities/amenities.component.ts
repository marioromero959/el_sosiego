import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdditionalServiceService } from '../../services/additional-service.service';
import { AdditionalService } from '../../models/additional-service.model';
import { ZoneService } from '../../services/zone.service';
import { Zone } from '../../models/zone.model';

@Component({
  selector: 'app-amenities',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './amenities.component.html',
  styleUrl: './amenities.component.scss'
})
export class AmenitiesComponent implements OnInit {
  facilities: Zone[] = [];
  facilitiesLoading = true;
  facilitiesError: string | null = null;
  
  additionalServices: AdditionalService[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private additionalServiceService: AdditionalServiceService,
    private zoneService: ZoneService
  ) {}

  ngOnInit() {
    this.loadAdditionalServices();
    this.loadFacilities();
  }

  private loadFacilities() {
    this.facilitiesLoading = true;
    this.facilitiesError = null;
    
    this.zoneService.getZones().subscribe({
      next: (zones) => {
        this.facilities = zones;
        this.facilitiesLoading = false;
      },
      error: (error) => {
        console.error('Error loading facilities:', error);
        this.facilitiesError = 'Error al cargar las instalaciones. Por favor, intente más tarde.';
        this.facilitiesLoading = false;
      }
    });
  }

  private loadAdditionalServices() {
    this.isLoading = true;
    this.error = null;
    
    this.additionalServiceService.getAdditionalServices().subscribe({
      next: (services) => {
        this.additionalServices = services;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading additional services:', error);
        this.error = 'Error al cargar los servicios adicionales. Por favor, intente más tarde.';
        this.isLoading = false;
      }
    });
  }

  getFormattedPrice(price: number): string {
    if (price === 0) {
      return 'Incluido';
    }
    return `Desde ${price.toLocaleString('es-AR')}$`;
  }

  getUniqueCategories(items: Array<{ name: string; category: string }>): string[] {
    return [...new Set(items.map(item => item.category))];
  }

  getItemsByCategory(items: Array<{ name: string; category: string }>, category: string): Array<{ name: string; category: string }> {
    return items.filter(item => item.category === category);
  }
}