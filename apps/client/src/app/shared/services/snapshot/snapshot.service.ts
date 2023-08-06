import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISymbol } from '@candlejumper/shared';

interface ISnapshot {
  indicators: any[];
  candles: number[][];
}

@Injectable({
  providedIn: 'root',
})
export class SnapshotService {
  constructor(private httpClient: HttpClient) {}

  fetchSnapshot(symbol: ISymbol, interval: string, orderTime: number): Observable<ISnapshot> {
    return this.httpClient.get<ISnapshot>(
      `/api/snapshot/${symbol.name}/${interval}/${orderTime}`
    );
  }
}
