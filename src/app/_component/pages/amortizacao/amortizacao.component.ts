import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import {
  getCurrentDate,
  formatDate,
  formatCurrency,
  getLastLine,
  verifyNumber,
  getQtdDias,
} from "../../util/util";
import {
  LANGUAGEM_TABLE,
  LISTA_AMORTIZACAO,
  AMORTIZACAO_DATA_ATUAL,
} from "../../util/constants";

declare interface TableData {
  dataRows: Array<Object>;
}

@Component({
  selector: "app-amortizacao",
  templateUrl: "./amortizacao.component.html",
})
export class AmortizacaoComponent implements OnInit {
  @Input() pesquisaFormValid: boolean;
  @Input() dataCalculo: string;
  @Input() tableDataAmortizacao: TableData;

  @Output() incluirAmortizacao = new EventEmitter();
  @Output() deleteAmortizacao = new EventEmitter();

  tableLoading = false;
  updateLoading = false;
  alertType = {
    mensagem: "",
    tipo: "",
  };

  preFormAmortizacao: FormGroup;
  dtOptionsAmortizacao: DataTables.Settings = {};
  amortizacao_field = LISTA_AMORTIZACAO;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.preFormAmortizacao = this.formBuilder.group({
      data_vencimento: [""],
      saldo_devedor: ["", Validators.required],
      tipo: ["", Validators.required],
    });

    this.dtOptionsAmortizacao = {
      paging: false,
      searching: false,
      ordering: false,
      scrollY: "300px",
      scrollCollapse: true,
      language: LANGUAGEM_TABLE,
    };
  }

  formatCurrency(value) {
    return formatCurrency(value);
  }

  formatCurrencyAmortizacao(value) {
    const amortizacao = this.formatCurrency(value);
    return typeof parseFloat(value) === "number" && parseFloat(value) !== 0
      ? `(${amortizacao})`
      : "---";
  }

  verifyNumber(value) {
    verifyNumber(value);
  }

  formatDate(value, format = "DD/MM/YYYY") {
    return formatDate(value, format);
  }

  adicionarAmortizacao() {
    const preFATipo = this.pre_form_amortizacao.tipo.value;

    switch (preFATipo) {
      case AMORTIZACAO_DATA_ATUAL:
        this.preFormAmortizacao.value.data_vencimento = this.formatDate(
          this.dataCalculo,
          "YYYY-MM-DD"
        );
        break;

      default:
        break;
    }

    this.tableDataAmortizacao.dataRows.push(this.preFormAmortizacao.value);

    this.incluirAmortizacao.emit(this.tableDataAmortizacao.dataRows);
    this.preFormAmortizacao.reset();

    // const preFATipo = this.pre_form_amortizacao.tipo.value;
    // const preFASaldoDevedor = this.pre_form_amortizacao.saldo_devedor.value;

    // switch (preFATipo) {
    //   case 'Data do Cálculo':
    //     const index = this.tableDataAmortizacao.dataRows.length - 1;
    //     const amorti = this.tableDataAmortizacao.dataRows[index];
    //     this.preFormAmortizacao.value['data_vencimento'] = row['dataCalcAmor'];

    //     if (row['totalDevedor'] == preFASaldoDevedor) {

    //       row['index'] = 0;
    //       this.pagas.push(row);

    //       amorti['amortizacaoDataDiferenciadaIncluida'] = true;
    //       row['amortizacaoIndex'] = index;
    //       amorti['pagoIndex'] = this.pagas.length - 1;
    //       row['status'] = "Pago";

    //       this.tableData.dataRows.splice(0, 1);

    //     } else {
    //       row['amortizacao'] = parseFloat(row['amortizacao']) + preFASaldoDevedor;
    //     }
    //     break;
    //   case 'Data Diferenciada':
    //     this.tableDataAmortizacao.dataRows.map((amorti, index) => {
    //       this.tableData.dataRows.map((row, key) => {

    //         if (row['amortizacaoDataDiferenciada'] || amorti['amortizacaoDataDiferenciadaIncluida']) {
    //           amorti['amortizacaoDataDiferenciadaIncluida'] = true;
    //           return;
    //         }

    //         switch (!amorti['amortizacaoDataDiferenciadaIncluida']) {
    //           case (row['totalDevedor'] > preFASaldoDevedor):
    //             const qtdDias = getQtdDias(row['dataCalcAmor'], amorti['data_vencimento']);
    //             const newParcela = {
    //               ...row,
    //               nparcelas: `${row['nparcelas']}.1`,
    //               amortizacao: "0.00",
    //               dataCalcAmor: amorti['data_vencimento'],
    //               dataVencimento: row['dataCalcAmor'],
    //               valorNoVencimento: row['totalDevedor'] - preFASaldoDevedor,
    //               encargosMonetarios: { ...row['encargosMonetarios'], jurosAm: { ...row['encargosMonetarios']['jurosAm'], dias: qtdDias } },
    //               amortizacaoDataDiferenciada: true
    //             };

    //             this.tableData.dataRows.splice(key + 1, 0, newParcela);
    //             row['amortizacao'] = preFASaldoDevedor;
    //             row['amortizacaoDataDiferenciadaIncluida'] = true;
    //             break;

    //           case (row['totalDevedor'] < preFASaldoDevedor):
    //             const diferenca = parseFloat(preFASaldoDevedor) - parseFloat(row['totalDevedor']);
    //             row['amortizacao'] = preFASaldoDevedor;
    //             if ((key + 1) < this.tableData.dataRows.length) this.tableData.dataRows[key + 1]['amortizacao'] = diferenca;
    //             amorti['amortizacaoDataDiferenciadaIncluida'] = true;
    //             break;

    //           default:
    //             row['index'] = key;
    //             this.pagas.push(row);
    //             amorti['amortizacaoDataDiferenciadaIncluida'] = true;
    //             row['amortizacaoIndex'] = index;
    //             amorti['pagoIndex'] = this.pagas.length - 1;
    //             row['status'] = "Pago";

    //             this.tableData.dataRows.splice(key, 1);
    //             break;
    //         }
    //       })
    //     });
    //     break;
    //   case 'Final':
    //     this.amortizacaoGeral += preFASaldoDevedor;
    //     break;
    //   default:
    //     break;
    // }
  }

  deleteRowAmortizacao(row) {
    const index = this.tableDataAmortizacao.dataRows.indexOf(row);
    this.tableDataAmortizacao.dataRows.splice(index, 1);

    setTimeout(() => {
      this.deleteAmortizacao.emit({
        0: row,
        1: this.tableDataAmortizacao.dataRows,
      });
    }, 0);

    // if (amortizacao.hasOwnProperty('pagoIndex')) {
    //   const rowtableData = this.pagas[amortizacao['pagoIndex']];
    //   tableData.splice(rowtableData['index'], 0, rowtableData);
    //   index = rowtableData['index'];
    //   tableData[index]['status'] = "Aberto";
    //   tableData[index]['amortizacao'] = tableData[index]['totalDevedor'] - amortizacao['saldo_devedor'];
    //   //tableData[index]['amortizacao'] = 0;
    //   this.pagas.splice(amortizacao['pagoIndex'], 1);

    // } else {
    //   switch (row['tipo']) {
    //     case 'Data do Cálculo':
    //       tableData[index]['amortizacao'] = 0;
    //       break;
    //     case 'Data Diferenciada':
    //       tableData[index]['amortizacao'] = 0;
    //       tableData.splice(index + 1, 1);
    //       break;
    //     case 'Final':
    //       this.amortizacaoGeral -= row['saldo_devedor'];
    //       break;
    //     default:
    //       break;
    //   }
    // }

    // index = this.tableDataAmortizacao.indexOf(row);
    // this.tableDataAmortizacao.splice(index, 1);

    // setTimeout(() => {
    //   this.simularCalc(false);
    //   this.toggleUpdateLoading()
    //   this.alertType = {
    //     mensagem: 'Registro excluido!',
    //     tipo: 'danger'
    //   };
    //   this.toggleUpdateLoading()
    // }, 0)
  }

  get pre_form_amortizacao() {
    return this.preFormAmortizacao.controls;
  }
}
