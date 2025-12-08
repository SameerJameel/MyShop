import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category';
import { BaseApiService } from '../../app/services/base-api.service';

@Injectable({ providedIn: 'root' })
export class CategoriesService extends BaseApiService<Category> {
  protected override resourcePath = 'categories';
}


