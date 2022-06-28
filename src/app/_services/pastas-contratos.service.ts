import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";

import * as PASTAS from "./pastas.json";

@Injectable({
  providedIn: "root",
})
export class PastasContratosService {
  pastas: any = PASTAS;

  constructor(private http: HttpClient) {}

  public getPastas(): Observable<any> {
    return this.pastas.default;
  }
}
