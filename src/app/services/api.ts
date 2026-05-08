import { JsonPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor () { }
    
    async getVendors() { 
      try {
        const response = await fetch(`${environment.apiUrl}/vendor`);
        if (response.ok) {
          const json = await response.json();
          return json;
        }
        return [];
      } catch (error) {
        console.log("Error dari api laravel", error);
        return[];
      }
    }

  }