import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vendor } from '../models/vendor';
import { BaseApiService } from '../../app/services/base-api.service';


@Injectable({ providedIn: 'root' })
export class VendorsService extends BaseApiService<Vendor> {
  protected override resourcePath = 'vendors';
}
