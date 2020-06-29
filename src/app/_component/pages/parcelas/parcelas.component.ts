import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import 'datatables.net';
import 'datatables.net-buttons';

import { getCurrentDate, formatDate, formatCurrency, getLastLine, verifyNumber, getQtdDias } from '../../util/util';
import { LANGUAGEM_TABLE, LISTA_STATUS } from '../../util/constants'

declare interface TableData {
  dataRows: Array<Object>;
}

@Component({
  selector: 'app-parcelas',
  templateUrl: './parcelas.component.html'
})
export class ParcelasComponent implements OnInit {

  @Input() pesquisaFormValid: boolean;
  @Output() incluirParcelas = new EventEmitter();

  status_field = LISTA_STATUS;
  preFormCadastroParcelas: FormGroup;
  updateLoadingBtn = false;
  tableLoading = false;
  updateLoading = false;
  alertType = {
    mensagem: '',
    tipo: ''
  };

  tableDataParcelas: TableData;
  dtOptions: DataTables.Settings = {};

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.tableDataParcelas = {
      dataRows: []
    }

    this.preFormCadastroParcelas = this.formBuilder.group({
      nparcelas: ['', Validators.required],
      parcelaInicial: ['', Validators.required],
      dataVencimento: ['', Validators.required],
      valorNoVencimento: ['', Validators.required],
      status: ['', Validators.required]
    })

    this.dtOptions = {
      paging: true,
      searching: false,
      language: LANGUAGEM_TABLE
    }

  }

  verifyNumber(value) {
    verifyNumber(value)
  }

  formatCurrency(value) {
    return formatCurrency(value)
  }

  formatDate(value, format = 'DD/MM/YYYY') {
    return formatDate(value, format)
  }

  adicionarParcelas() {
    const nParcelas = this.pre_form_cadastro_parcelas.nparcelas.value;
    const parcelaInicial = this.pre_form_cadastro_parcelas.parcelaInicial.value;
    this.tableDataParcelas.dataRows = [];

    for (let index = parcelaInicial; index < (nParcelas + parcelaInicial); index++) {
      this.tableDataParcelas.dataRows.push({ ...this.preFormCadastroParcelas.value, nparcelas: index });
    }

    this.preFormCadastroParcelas.reset();
  }

  changeCadastroParcelas(e, row, col) {
    const index = this.tableDataParcelas.dataRows.indexOf(row);
    this.tableDataParcelas.dataRows[index][col] = col === 'valorNoVencimento' ? e.target.value.slice(2) : e.target.value;
  }

  incluir() {
    this.incluirParcelas.emit(this.tableDataParcelas.dataRows);
    setTimeout(() => {
      this.tableDataParcelas.dataRows = [];
    }, 100);
  }


  deleteRowParcelas(row) {
    const index = this.tableDataParcelas.dataRows.indexOf(row);

    this.tableDataParcelas.dataRows.splice(index, 1);
    setTimeout(() => {
      this.alertType = {
        mensagem: 'Registro excluido!',
        tipo: 'danger'
      };
    }, 0)
  }

  get pre_form_cadastro_parcelas() { return this.preFormCadastroParcelas.controls; }
}