import { Component, OnInit } from '@angular/core';
import { Lancamento } from '../../../_models/ChequeEmpresarial';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment'; // add this 1 of 4

declare interface TableData {
  headerRow: Array<Object>;
  dataRows: Array<Object>;
}

@Component({
  selector: 'cheque-empresarial-cmp',
  moduleId: module.id,
  templateUrl: 'cheque-empresarial.component.html'
})

export class ChequeEmpresarialComponent implements OnInit {

  ceForm: FormGroup;
  ceFormRiscos: FormGroup;
  ceFormAmortizacao: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  errorMessage = '';
  payloadLancamento: Lancamento;
  tableData: TableData;
  tableLoading = false;

  // total
  total_date_now: any;
  total_data_calculo: any;
  total_honorarios = 0;
  total_multa_sob_contrato = 0;
  total_subtotal = 0;
  total_grandtotal = 0;

  dtOptions: DataTables.Settings = {};

  constructor(
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit() {
    // this.filterContracts();

    this.ceForm = this.formBuilder.group({
      ce_pasta: [],
      ce_contrato: ['', Validators.required],
      ce_tipo_contrato: []
    });
    this.ceFormRiscos = this.formBuilder.group({
      ce_indice: [],
      ce_encargos_monietarios: [],
      ce_data_calculo: [],
      ce_encargos_contratuais: [],
      ce_multa: [],
      ce_juros_mora: [],
      ce_honorarios: [],
      ce_multa_sobre_constrato: []
    });
    this.tableData = {
      headerRow: [],
      dataRows: []
    }
    this.ceFormAmortizacao = this.formBuilder.group({
      ceFA_data_vencimento: [],
      ceFa_saldo_devedor: [],
      ceFA_data_base_atual: ['', Validators.required],
      ceFA_valor_lancamento: ['', Validators.required],
      ceFA_tipo_lancamento: ['', Validators.required],
      ceFA_tipo_amortizacao: []
    });
    this.buildHeaderTable();

    this.dtOptions = {
      paging: false,
      // pagingType: 'full_numbers',
      language: {
        "decimal": "",
        "emptyTable": "Sem dados para exibir",
        "info": "Mostrando _START_ de _END_ de _TOTAL_ registros",
        "infoEmpty": "Mostrando 0 de 0 de 0 registros",
        "infoFiltered": "(filtered from _MAX_ total registros)",
        "infoPostFix": "",
        "thousands": ",",
        "lengthMenu": "Mostrando _MENU_ registros",
        "loadingRecords": "Carregando...",
        "processing": "Processando...",
        "search": "Buscar:",
        "zeroRecords": "Nenhum registro encontrado com esses parâmetros",
        "paginate": {
          "first": "Primeira",
          "last": "Última",
          "next": "Próxima",
          "previous": "Anterior"
        },
        "aria": {
          "sortAscending": ": Ordernar para cima",
          "sortDescending": ": Ordernar para baixo"
        }
      }
    };
  }

  // convenience getter for easy access to form fields
  get ce_form() { return this.ceForm.controls; }
  get ce_form_riscos() { return this.ceFormRiscos.controls; }
  get ce_form_amortizacao() { return this.ceFormAmortizacao.controls; }

  resetFields(form) {
    this[form].reset()
  }

  formatCurrency(value) {
    return `R$ ${(parseFloat(value)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  }

  verifyNumber(value) {
    value.target.value = Math.abs(value.target.value);
  }

  incluirLancamentos() {
    this.tableLoading = true;
    const lastLine = this.tableData.dataRows.length === 0 ? this.tableData.dataRows.length : this.tableData.dataRows.length - 1;
    const localDataBase = this.tableData.dataRows.length === 0 ? this.ce_form_amortizacao.ceFA_data_vencimento.value : this.tableData.dataRows[lastLine]["dataBaseAtual"];
    const localValorDevedor = this.tableData.dataRows.length === 0 ? this.ce_form_amortizacao.ceFa_saldo_devedor.value : this.tableData.dataRows[lastLine]["valorDevedorAtualizado"];

    const localTypeIndice = this.ce_form_riscos.ce_indice.value;
    const localTypeValue = this.getIndiceDataBase(localTypeIndice);

    const localLancamentos = this.ce_form_amortizacao.ceFA_valor_lancamento.value;
    const localTipoLancamento = this.ce_form_amortizacao.ceFA_tipo_lancamento.value;
    const localDataBaseAtual = this.ce_form_amortizacao.ceFA_data_base_atual.value;

    setTimeout(() => {
      this.payloadLancamento = ({
        dataBase: localDataBase,
        indiceDB: localTypeIndice,
        indiceDataBase: localTypeValue,
        indiceBA: localTypeIndice,
        indiceDataBaseAtual: localTypeValue,
        indiceEncargosContratuais: null,
        dataBaseAtual: localDataBaseAtual,
        indiceDataAtual: null,
        valorDevedor: localValorDevedor,
        encargosMonetarios: {
          correcaoPeloIndice: null,
          jurosAm: {
            dias: null,
            percentsJuros: null,
            // moneyValue: null,
          },
          multa: null,
        },
        lancamentos: localLancamentos,
        tipoLancamento: localTipoLancamento,
        valorDevedorAtualizado: null,
        contractRef: null
      });
      this.ce_form_amortizacao.ceFA_tipo_amortizacao.value ? this.tableData.dataRows.unshift(this.payloadLancamento) : this.tableData.dataRows.push(this.payloadLancamento);
      this.tableLoading = false;
    }, 0);
    this.resetFields('ceFormAmortizacao');
    this.simularCalc(true);
  }

  filterContracts() {
    this.tableLoading = true;
    setTimeout(() => {
      this.tableData.dataRows = this.Carga.filter((row) => row["contractRef"] === parseInt(this.ce_form.ce_contrato.value || 0));
      this.tableLoading = false;
    }, 1000);
    this.simularCalc(true);
  }

  getCurrentDate(format = "DD/MM/YYYY hh:mm") {
    return moment(new Date).format(format);
  }

  getQtdDias(fistDate, secondDate) {
    const a = moment(fistDate, 'DD/MM/YYYY');
    const b = moment(secondDate, 'DD/MM/YYYY');
    return Math.abs(b.diff(a, 'days'));
  }

  changeDate(e, row) {
    row['dataBaseAtual'] = moment(e.target.value).format("YYYY-MM-DD");

    this.simularCalc(true);
  }

  formatDate(row) {
    return moment(row['dataBase']).format("DD-MM-YYYY");
  }

  simularCalc(isInlineChange = false) {
    this.tableLoading = true;
    setTimeout(() => {
      let teste = this.tableData.dataRows.map(row => {

        const qtdDias = this.getQtdDias(moment(row["dataBase"]).format("DD/MM/YYYY"), moment(row["dataBaseAtual"]).format("DD/MM/YYYY"));
        const valorDevedor = parseFloat(row['valorDevedor']);

        // - Indices
        if (!isInlineChange) {
          this.ce_form_riscos.ce_indice && (row['indiceDB'] = this.ce_form_riscos.ce_indice.value);
          this.ce_form_riscos.ce_indice && (row['indiceBA'] = this.ce_form_riscos.ce_indice.value);

          this.ce_form_riscos.ce_indice && (row['indiceDataBase'] = this.getIndiceDataBase(this.ce_form_riscos.ce_indice.value));
          this.ce_form_riscos.ce_indice && (row['indiceDataBaseAtual'] = this.getIndiceDataBase(this.ce_form_riscos.ce_indice.value));
        }

        // Table Values

        // - Descontos
        // -- correcaoPeloIndice (encargos contratuais, inpc, iof, cmi)
        row['encargosMonetarios']['correcaoPeloIndice'] = ((valorDevedor * row['indiceDataBaseAtual'] / 30) * qtdDias).toFixed(2);
        // -- dias
        row['encargosMonetarios']['jurosAm']['dias'] = qtdDias;
        // -- juros 
        row['encargosMonetarios']['jurosAm']['percentsJuros'] = ((((valorDevedor + parseFloat(row['encargosMonetarios']['correcaoPeloIndice'])) / 30) * qtdDias / 100) * (this.ce_form_riscos.ce_juros_mora.value || 1)).toFixed(2);
        // -- multa 
        row['encargosMonetarios']['multa'] = ((valorDevedor + parseFloat(row['encargosMonetarios']['correcaoPeloIndice']) + parseFloat(row['encargosMonetarios']['jurosAm']['percentsJuros'])) * (this.ce_form_riscos.ce_multa.value / 100)).toFixed(2);
        // -- ???
        // row['encargosMonetarios']['jurosAm']['moneyValue'] = 99999999999;
        row['valorDevedorAtualizado'] = ((valorDevedor + parseFloat(row['encargosMonetarios']['correcaoPeloIndice']) + parseFloat(row['encargosMonetarios']['jurosAm']['percentsJuros']) + parseFloat(row['encargosMonetarios']['multa']) + (row['tipoLancamento'] === 'credit' ? (row['lancamentos'] * (-1)) : row['lancamentos']))).toFixed(2);

        // Amortizacao
        // this.ce_form_amortizacao.ceFA_saldo_devedor && (row['valorDevedorAtualizado'] = this.ce_form_amortizacao.ceFA_saldo_devedor.value)
        // this.ce_form_amortizacao.ceFA_data_vencimento && (row['dataBase'] = this.ce_form_riscos.ceFA_data_vencimento.value);

        // this.ce_form_riscos.ce_encargos_contratuais && (row['indiceEncargosContratuais'] = this.ce_form_riscos.ce_encargos_contratuais.value);

        // Forms Total
        this.ce_form_riscos.ce_data_calculo && (this.total_date_now = this.getCurrentDate());
        this.ce_form_riscos.ce_data_calculo && (this.total_data_calculo = this.total_date_now = this.getCurrentDate());
        this.ce_form_riscos.ce_honorarios && (this.total_honorarios = this.ce_form_riscos.ce_honorarios.value);
        this.ce_form_riscos.ce_multa_sobre_constrato && (this.total_multa_sob_contrato = this.ce_form_riscos.ce_multa_sobre_constrato.value);

        // this.total_subtotal = 1000;
        // this.total_grandtotal = this.total_grandtotal + row['valorDevedorAtualizado'];

        this.tableLoading = false;
        return parseFloat(row['valorDevedorAtualizado']);
      });
      this.total_grandtotal = teste.reduce(function (acumulador, valorAtual) {
        return acumulador + valorAtual;
      }) + this.total_multa_sob_contrato + this.total_honorarios;
    }, 4);
  }

  getIndiceDataBase(indice) {
    return parseFloat(this.indice_field.filter(ind => ind.type === indice).map(ind => ind.value)[0]);
  }

  updateInlineIndice(e, row, innerIndice, indiceToChangeInline) {
    row[innerIndice] = e.target.value;
    row[indiceToChangeInline] = this.getIndiceDataBase(e.target.value);

    this.simularCalc(true);
  }

  // Mock formulário de riscos
  // Consulta 

  folderData_field = [1, 2, 3, 5, 6, 7, 8, 9, 10];

  contractList_field = [{
    title: "AA",
    id: "0",
    fodlerRef: "1",
  }, {
    title: "BB",
    id: "1",
    fodlerRef: "1",
  }, {
    title: "CC",
    id: "2",
    fodlerRef: "2",
  },
  {
    title: "DD",
    id: "3",
    fodlerRef: "3",
  },
  {
    title: "EE",
    id: "4",
    fodlerRef: "1",
  }];

  typeContractList_field = ["Cheque empresarial", "Parcelado", "Pós"];

  indice_field = [{
    type: "---",
    value: "1"
  }, {
    type: "INPC",
    value: "60.872914"
  },
  {
    type: "CDI",
    value: "71.712333"
  },
  {
    type: "IGPM",
    value: "1.24"
  },
  {
    type: "Encargos Contratuais %",
    value: "1"
  }
  ];

  buildHeaderTable() {
    this.tableData.headerRow = [{
      dataBase: {
        title: "Data Base",
        nested: false
      },
      dataBaseAtual: {
        title: "Data Base Atual",
        nested: false
      },
      indiceDB: {
        title: "Indíce",
        nested: false
      },
      indiceDataBase: {
        title: "Indíce Data Base",
        nested: false
      },
      indiceBA: {
        title: "Indíce",
        nested: false
      },
      indiceDataBaseAtual: {
        title: "Indíce Data Base Atual",
        nested: false
      },
      valorDevedor: {
        title: "Valor Devedor",
        nested: false
      },
      encargosMonetarios: {
        title: "Encargos Monetarios",
        nested: false
      },
      correcaoPeloIndice: {
        title: "Correção Pelo Indíce",
        nested: false
      },
      // jurosAm: {
      //   title: "Juros Ao mês",
      //   nested: false
      // },
      dias: {
        title: "Qtd Dias",
        nested: false
      },
      percentsJuros: {
        title: "Juros",
        nested: false
      },
      // moneyValue: {
      //   title: "R$",
      //   nested: false
      // },
      multa: {
        title: "Multa",
        nested: false
      },
      lancamentos: {
        title: "Lançamentos",
        nested: false
      },
      valorDevedorAtualizado: {
        title: "Valor Devedor Atualizado",
        nested: false
      }
    }];
  }

  get Carga() {
    return [
      {
        dataBase: "2020-04-23",
        indiceDB: null,
        indiceDataBase: null,
        indiceBA: null,
        indiceDataBaseAtual: null,
        indiceEncargosContratuais: null,
        dataBaseAtual: "2020-04-25",
        indiceDataAtual: null,
        valorDevedor: 100000,
        encargosMonetarios: {
          correcaoPeloIndice: "0.00",
          jurosAm: {
            dias: 2,
            percentsJuros: "66.67"
          },
          multa: "0.00"
        },
        lancamentos: 1000,
        tipoLancamento: "debit",
        valorDevedorAtualizado: "101066.67",
        contractRef: 0
      },
      {
        dataBase: "2020-04-25",
        indiceDB: null,
        indiceDataBase: null,
        indiceBA: null,
        indiceDataBaseAtual: null,
        indiceEncargosContratuais: null,
        dataBaseAtual: "2020-04-28",
        indiceDataAtual: null,
        valorDevedor: 100000,
        encargosMonetarios: {
          correcaoPeloIndice: "0.00",
          jurosAm: {
            dias: 2,
            percentsJuros: "66.67"
          },
          multa: "0.00"
        },
        lancamentos: 1000,
        tipoLancamento: "debit",
        valorDevedorAtualizado: "101066.67",
        contractRef: 0
      }];
  }

}