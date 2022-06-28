import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { environment } from "../../environments/environment";
import { Parcela } from "../_models/ParceladoPre";

@Injectable({ providedIn: "root" })
export class ParceladoPreService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Parcela[]>(`${environment.API_PATH}/parcelado-pre`);
    // return [{
    //   id: 22,
    //   nparcelas: 3,
    //   parcelaInicial: 3,
    //   dataVencimento: "2019-01-01",
    //   indiceDV: "INPC/IBGE",
    //   indiceDataVencimento: 69.876800,
    //   indiceDCA: 'INPC/IBGE',
    //   indiceDataCalcAmor: 71.590624,
    //   dataCalcAmor: "2019-01-01",
    //   valorNoVencimento: 10222.38,
    //   encargosMonetarios: '{"correcaoPeloIndice":"1147.12","jurosAm":{"dias":1,"percentsJuros":"0.03","moneyValue":"38.62"},"multa":"2317.96"}',
    //   subtotal: 134,
    //   valorPMTVincenda: 118349.84,
    //   amortizacao: 0,
    //   totalDevedor: 114712.14,
    //   status: 'ABERTO',
    //   contractRef: 'SBA.132386/201614826170540 - MUTUO PRE RV',
    //   ultimaAtualizacao: '',
    //   infoParaCalculo: '{ "formMulta" : "2", "formJuros" : "2", "formHonorarios" : "2", "formMultaSobContrato" : "2", "formIndice" : "INPC/IBGE", "formIndiceEncargos" : "2"}'
    // },
    // {
    //   id: 22,
    //   nparcelas: 4,
    //   parcelaInicial: 3,
    //   dataVencimento: "2020-08-08",
    //   indiceDV: "CDI",
    //   indiceDataVencimento: 658.2287,
    //   indiceDCA: 'CDI',
    //   indiceDataCalcAmor: 658.2287,
    //   dataCalcAmor: "2020-07-09",
    //   valorNoVencimento: 114712.14,
    //   encargosMonetarios: '{"correcaoPeloIndice":"1147.12","jurosAm":{"dias":1,"percentsJuros":"0.03","moneyValue":"38.62"},"multa":"2317.96"}',
    //   subtotal: 134,
    //   valorPMTVincenda: 118349.84,
    //   amortizacao: 100,
    //   totalDevedor: 114712.14,
    //   status: 'ABERTO',
    //   contractRef: 'SBA.132386/201614826170540 - MUTUO PRE RV',
    //   ultimaAtualizacao: '',
    //   infoParaCalculo: '{ "formMulta" : "2", "formJuros" : "2", "formHonorarios" : "2", "formMultaSobContrato" : "2", "formIndice" : "INPC/IBGE", "formIndiceEncargos" : "2"}'
    // }]
  }

  getLancamento(id: number) {
    return this.http.get<Parcela[]>(
      `${environment.API_PATH}/parcelado-pre/${id}`
    );
  }

  addLancamento(payload: any) {
    return this.http.post(`${environment.API_PATH}/parcelado-pre`, payload);
  }

  updateLancamento(payload: any) {
    return this.http.put(`${environment.API_PATH}/parcelado-pre`, payload);
  }

  removeLancamento(id: number) {
    return this.http.delete(`${environment.API_PATH}/parcelado-pre/${id}`);
  }
}
