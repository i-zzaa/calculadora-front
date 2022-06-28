import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { environment } from "../../environments/environment";
import { Lancamento } from "../_models/ChequeEmpresarial";

@Injectable({ providedIn: "root" })
export class ChequeEmpresarialService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Lancamento[]>(
      `${environment.API_PATH}/cheque-empresarial`
    );
  }

  getLancamento(id: number) {
    return this.http.get<Lancamento[]>(
      `${environment.API_PATH}/cheque-empresarial/${id}`
    );
  }

  addLancamento(lancamentoList: any) {
    return this.http.post(
      `${environment.API_PATH}/cheque-empresarial`,
      lancamentoList
    );
  }

  updateLancamento(lancamentoList: any) {
    return this.http.put(
      `${environment.API_PATH}/cheque-empresarial`,
      lancamentoList
    );
  }

  removeLancamento(id: number) {
    return this.http.delete(`${environment.API_PATH}/cheque-empresarial/${id}`);
  }
}
