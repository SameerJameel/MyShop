import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Item } from '../models/item';
import { BaseApiService } from '../../app/services/base-api.service';



@Injectable({ providedIn: 'root' })

export class ItemsService extends BaseApiService<Item> {
  protected override resourcePath = 'items';
}


