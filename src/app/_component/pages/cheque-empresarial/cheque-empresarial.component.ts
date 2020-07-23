import { Component, OnInit } from '@angular/core';

import { Lancamento, InfoParaCalculo } from '../../../_models/ChequeEmpresarial';
import { ChequeEmpresarialService } from '../../../_services/cheque-empresarial.service';

import { IndicesService } from '../../../_services/indices.service';

import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LogService } from '../../../_services/log.service';

import { getCurrentDate, formatDate, formatCurrency, getLastLine, verifyNumber, getQtdDias,isVincenda, setCampoSemAlteracao } from '../../util/util';
import { LISTA_INDICES, LANGUAGEM_TABLE, CHEQUE_EMPRESARIAL } from '../../util/constants'

import 'datatables.net';
import 'datatables.net-buttons';

declare interface TableData {
  dataRows: Array<Object>;
}

@Component({
  selector: 'cheque-empresarial-cmp',
  moduleId: module.id,
  templateUrl: 'cheque-empresarial.component.html'
})

export class ChequeEmpresarialComponent implements OnInit {

  ceFormAmortizacao: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  errorMessage = '';
  payloadLancamento: Lancamento;
  tableData: TableData;
  tableLoading = false;
  updateLoading = false;
  alertType = {
    mensagem: '',
    tipo: ''
  };
  updateLoadingBtn = false;
  controleLancamentos = 0;
  tableHeader = [];
  form_riscos: any = {};

  indice_field = LISTA_INDICES;
  infoContrato = {};
  indiceDataBase = null;
  indiceDataBaseAtual = null;

  // total
  total_date_now: any;
  total_data_calculo: any;
  subtotal_data_calculo: any;
  total_honorarios = 0;
  total_multa_sob_contrato = 0;
  total_subtotal = 0;
  total_grandtotal = 0;
  contractRef = '';

  dtOptions: DataTables.Settings = {};
  last_data_table: Object;
  min_data: string;
  ultima_atualizacao: String;

  formDefaultValues: InfoParaCalculo = {
    formDataCalculo: getCurrentDate("YYYY-MM-DD"),
    formMulta: 0,
    formJuros: 0,
    formHonorarios: 0,
    formMultaSobContrato: 0,
    formIndice: null,
    formIndiceEncargos: 1
  };

  constructor(
    private formBuilder: FormBuilder,
    private chequeEmpresarialService: ChequeEmpresarialService,
    private indicesService: IndicesService,
    private logService: LogService,
  ) {
  }

  ngOnInit() {
    this.tableData = {
      dataRows: []
    }
    this.ceFormAmortizacao = this.formBuilder.group({
      ceFA_data_vencimento: [],
      ceFa_saldo_devedor: [],
      ceFA_tipo: new FormControl({value:'lancamento', disabled: false}, Validators.required),
      ceFA_data_base_atual: ['', Validators.required],
      ceFA_valor_lancamento: [],
      ceFA_tipo_lancamento: []
    });

    this.dtOptions = {
      paging: false,
      ordering: false,
      searching: false,
      dom: 'Bfrtip',
      buttons: [{
        extend: 'pdfHtml5',
        orientation: 'landscape',
        header: true,
        footer: true,
        pageSize: 'LEGAL',
        exportOptions: {
          columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
        },
        customize: doc => {

          doc['defaultStyle'] = { ...doc['defaultStyle'], fontSize: 8 }
          doc['styles']['tableHeader'] = { ...doc['styles']['tableHeader'], fontSize: 8, color: 'black', fillColor: 'white' }
          doc['styles']['tableFooter'] = { ...doc['styles']['tableFooter'], fontSize: 8, color: 'black', fillColor: 'white' }

          doc['content'][0].text = 'MOVIMENTAÇÕES POSTERIORES AO VENCIMENTO';
          doc['content'][1]['table']['widths'] = [80, 100, 40, 50, 100, 40, 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];

          const footer = doc['content'][1]['table']['body'].pop();
          const valor = footer.pop();
          footer.map((value, index) => {
            if (index !== 0) {
              value.text = "";
            }
          })
          footer.push(valor);
          doc['content'][1]['table']['body'].push(footer);

          doc['content'][1]['table']['body'].map((row, index) => {
            if (index !== 0 && this.tableData.dataRows.length - 1 >= index - 1) {
              row[1].text = this.tableData.dataRows[index - 1]['indiceDB'];
              row[4].text = this.tableData.dataRows[index - 1]['indiceBA'];

              row.map(item => item.alignment = 'center');
            }
          })

          doc['content'].push({
            style: { fontSize: 10 },
            alignment: 'left',
            margin: [0, 20, 10, 0],
            text: `Honorários ${this.formDefaultValues.formHonorarios || 0}% : ${formatCurrency(this.total_honorarios)}`
          })

          doc['content'].push({
            style: { fontSize: 10 },
            alignment: 'left',
            margin: [0, 0, 10, 0],
            text: `Multa sob contrato ${this.formDefaultValues.formMultaSobContrato || 0}% : ${formatCurrency(this.total_multa_sob_contrato)}`
          })

          doc['content'].push({
            style: { fontSize: 10 },
            alignment: 'left',
            margin: [0, 0, 10, 0],
            text: `TOTAL APURADO EM ${this.total_data_calculo || "---------"} : ${formatCurrency(this.total_grandtotal)}`
          })

        }
      }],
      language: LANGUAGEM_TABLE
    }
  }


  formatCurrency(value) {
    return formatCurrency(value)
  }

  verifyNumber(value) {
    verifyNumber(value)
  }

  formatDate(value, format = 'DD/MM/YYYY') {
    return formatDate(value, format)
  }

  formartTable(acao) {
    const inter = setInterval(() => {
      let table = document.getElementById('tableCheque').innerHTML;

      if (table) {
        table = table.replace(/log-visible-false/g, 'log-visible-true ');
        table = table.replace(/log-hidden-false/g, 'log-hidden-true ');
        clearInterval(inter)
        this.logService.addLog([{
          data: getCurrentDate("YYYY-MM-DD"),
          usuario: window.localStorage.getItem('username').toUpperCase(),
          pasta: this.infoContrato['pasta'],
          contrato: this.infoContrato['contrato'],
          tipoContrato: this.infoContrato['tipo_contrato'],
          dataSimulacao: this.form_riscos.formDataCalculo,
          acao: acao,
          infoTabela: table,
          modulo: CHEQUE_EMPRESARIAL
        }]).subscribe()
      }
    }, 0)
  }

  atualizarRiscoConcluido() {
    this.controleLancamentos++;
    this.formartTable('Atualização de Risco');
    this.ultima_atualizacao = getCurrentDate('YYYY-MM-DD');

    this.alertType = {
      mensagem: 'Risco Atualizado',
      tipo: 'success'
    };
    this.toggleUpdateLoading()
  }

  atualizarRiscoFalha() {
    this.tableLoading = false;
    this.alertType = {
      mensagem: 'Falha ao atualizar risco',
      tipo: 'danger'
    };
    this.toggleUpdateLoading()
  }

  atualizarRisco() {
    this.controleLancamentos = 0;

    const payload = this.tableData.dataRows.map(lancamento => {
      if (!lancamento['isTipoLancamento']) return;

      this.updateLoadingBtn = true;
      let lancamentoLocal = { ...lancamento };
      lancamentoLocal['encargosMonetarios'] = JSON.stringify(lancamentoLocal['encargosMonetarios']);
      lancamentoLocal['infoParaCalculo'] = JSON.stringify(this.formDefaultValues);
      lancamentoLocal['valorDevedor'] = parseFloat(lancamentoLocal['valorDevedor']);
      lancamentoLocal['valorDevedorAtualizado'] = parseFloat(lancamentoLocal['valorDevedorAtualizado']);
      lancamentoLocal['contractRef'] = this.contractRef;
      lancamentoLocal['ultimaAtualizacao'] = getCurrentDate('YYYY-MM-DD');

      return lancamentoLocal;
    });

    const payloadPut = payload.filter((lancamento =>  lancamento && lancamento['id']));
    payloadPut.length > 0 && this.chequeEmpresarialService.updateLancamento(payloadPut).subscribe(chequeEmpresarialList => {
      this.atualizarRiscoConcluido()
    }, err => {
      this.atualizarRiscoFalha()
    });

    const payloadPost = payload.filter((lancamento => lancamento && !lancamento['id']));
    payloadPost.length > 0 && this.chequeEmpresarialService.addLancamento(payloadPost).subscribe(chequeEmpresarialListUpdated => {
      this.atualizarRiscoConcluido()

    }, err => {
      this.atualizarRiscoFalha();
    });
  }

  toggleUpdateLoading() {
    this.updateLoading = true;
    setTimeout(() => {
      this.updateLoading = false;
      this.updateLoadingBtn = false;
    }, 5000);
  }

  get ce_form_amortizacao() { return this.ceFormAmortizacao.controls; }

  lancamentoInfo() {
     const lanca = this.tableData.dataRows.filter(row=> !row['isTipoLancamento']);
    return !!lanca.length;
  }

  incluirLancamentos() {

    const lastLine = getLastLine(this.tableData.dataRows) || {};
    const isTipoLancamento = this.ce_form_amortizacao.ceFA_tipo.value === 'lancamento';

    if ((this.form_riscos.formIndice === undefined && isTipoLancamento) || (!Object.keys(lastLine).length && !isTipoLancamento)) {
      this.updateLoadingBtn = true;
      this.alertType = {
        mensagem: 'É necessário informar o índice.',
        tipo: 'warning'
      };
      this.toggleUpdateLoading()
      return;
    }

    const veirifcarLancamento = this.lancamentoInfo();
    if (veirifcarLancamento) {
      this.tableData.dataRows.pop();
    }

    this.setFormDefault()

    this.updateLoadingBtn = false;
    this.tableLoading = true;

    const lancamento = this.ce_form_amortizacao;

    const localDataBase = this.tableData.dataRows.length === 0 ? lancamento.ceFA_data_vencimento.value : lastLine["dataBaseAtual"];
    const localValorDevedor = this.tableData.dataRows.length === 0 ? lancamento.ceFa_saldo_devedor.value : lastLine["valorDevedorAtualizado"];

    this.total_date_now = formatDate(localDataBase);
    this.total_data_calculo = formatDate(this.form_riscos.formDataCalculo) || getCurrentDate();
    this.subtotal_data_calculo = this.total_date_now;

    const localLancamentos = isTipoLancamento ? lancamento.ceFA_valor_lancamento.value : "NaN";
    const localTipoLancamento = isTipoLancamento ? lancamento.ceFA_tipo_lancamento.value : 'debit';
    const localDataBaseAtual = lancamento.ceFA_data_base_atual.value;

    const localTypeIndice = isTipoLancamento ? this.form_riscos.formIndice : lastLine.indiceBA ;
    const localInfoParaCalculo: InfoParaCalculo = this.form_riscos;

    const getIndiceDataBase = new Promise((res, rej) => {
      this.indicesService.getIndiceDataBase(localTypeIndice, localDataBase, this.formDefaultValues).then((data) => res(data))
    })

    const getIndiceDataBaseAtual = new Promise((res, rej) => {
      this.indicesService.getIndiceDataBase(localTypeIndice, localDataBaseAtual, this.formDefaultValues).then((data) => res(data))
    })

    Promise.all([getIndiceDataBase, getIndiceDataBaseAtual]).then(resultado => {
      const localTypeIndiceDataBase = typeof (resultado[0]) === 'number' ? resultado[0] : 1;
      const localTypeIndiceDataBaseAtual = typeof (resultado[1]) === 'number' ? resultado[1] : 1;

      this.payloadLancamento = ({
        dataBase: localDataBase,
        indiceDB: localTypeIndice,
        indiceDataBase: localTypeIndiceDataBase,
        indiceBA: localTypeIndice,
        indiceDataBaseAtual: localTypeIndiceDataBaseAtual,
        dataBaseAtual: localDataBaseAtual,
        valorDevedor: localValorDevedor,
        encargosMonetarios: {
          correcaoPeloIndice: null,
          jurosAm: {
            dias: null,
            percentsJuros: null,
            moneyValue: null,
          },
          multa: null,
        },
        lancamentos: localLancamentos,
        tipoLancamento: localTipoLancamento,
        valorDevedorAtualizado: null,
        contractRef: this.contractRef,
        ultimaAtualizacao: '',
        infoParaCalculo: { ...localInfoParaCalculo },
        isTipoLancamento: isTipoLancamento,
        modulo: CHEQUE_EMPRESARIAL
      });
      this.tableData.dataRows.push(this.payloadLancamento)
      this.tableLoading = false;

      if (!this.lancamentoInfo() && isTipoLancamento && (Object.keys(lastLine).length && !lastLine['isTipoLancamento'])) {
        this.tableData.dataRows.push(lastLine);
      }

      setTimeout(() => {
        this.ceFormAmortizacao.reset({ceFA_tipo: 'lancamento'});

        this.simularCalc(true, null, true)
        this.simularCalc(true, null, true)

        this.alertType = {
          mensagem: 'Registro incluido!',
          tipo: 'success'
        };
        this.toggleUpdateLoading()
      }, 0)
    });
  }

  pesquisarContratos(infoContrato) {
    this.tableLoading = true;
    this.ultima_atualizacao = '';
    this.tableData.dataRows = [];

    this.contractRef = infoContrato.contractRef;
    this.infoContrato = infoContrato;

    this.chequeEmpresarialService.getAll().subscribe(chequeEmpresarialList => {
      this.tableData.dataRows = chequeEmpresarialList.filter((row) => row["contractRef"] === infoContrato.contractRef).map(cheque => {
        cheque.encargosMonetarios = JSON.parse(cheque.encargosMonetarios)
        cheque.infoParaCalculo = JSON.parse(cheque.infoParaCalculo)
        cheque.isTipoLancamento = true;
        cheque.modulo = CHEQUE_EMPRESARIAL;

        const ultimaAtualizacao = [...chequeEmpresarialList].pop();
        this.ultima_atualizacao = formatDate(ultimaAtualizacao.ultimaAtualizacao, 'YYYY-MM-DD');

        Object.keys(cheque.infoParaCalculo).filter(value => {
          this.formDefaultValues[value] = cheque.infoParaCalculo[value];
        });

        setTimeout(() => {
          this.simularCalc(true, null, true);
        }, 1000);

        return cheque;
      });

      if (!this.tableData.dataRows.length) {
        this.alertType = {
          mensagem: 'Nenhuma lançamento encontrado!',
          tipo: 'warning'
        };
        this.tableLoading = false;
        this.toggleUpdateLoading()
        return;
      }

      this.tableLoading = false;
    }, err => {
      this.alertType = {
        mensagem: 'Nenhuma lançamento encontrado!',
        tipo: 'warning'
      };
      this.tableLoading = false;
      this.toggleUpdateLoading()
    });

  }

  changeDate(e, row) {
    const data = formatDate(e.target.value, 'YYYY-MM-DD');

    const getIndice = new Promise((res, rej) => {
      this.indicesService.getIndiceDataBase(this.formDefaultValues.formIndice, data, this.formDefaultValues).then((data) => {
        res(data)
      })
    })

    Promise.all([getIndice]).then(resultado => {
      row['dataBaseAtual'] = data;
      row['indiceDataBaseAtual'] = resultado[0]
      setTimeout(() => {
        this.simularCalc(true);
      }, 0);
    })
  }

  setFormRiscos(form) {
    Object.keys(form).filter((value, key) => {
      if (form[value] !== null && form[value] !== 'undefined') {
        this.form_riscos[value] = form[value];
      }
    });
  }

  setFormDefault() {
    Object.keys(this.form_riscos).filter((value, key) => {
      if (this.form_riscos[value] !== null && this.form_riscos[value] !== 'undefined') {
        this.formDefaultValues[value] = this.form_riscos[value];
      }
    });
  }

  simularCalc(isInlineChange = false, origin = null, search = false) {
    this.tableLoading = true;
    this.total_multa_sob_contrato = 0;
    this.total_grandtotal = 0;
    this.total_honorarios = 0;

    if (origin === 'btn') {
      this.setFormDefault()
    }

    setTimeout(() => {

      this.tableData.dataRows.map(async (row, index) => {
        if (!isInlineChange) {
          const indice = this.formDefaultValues.formIndice;
          row['indiceDB'] = indice;
          row['indiceBA'] = indice;
        }

        const getIndiceDataBase = new Promise((res, rej) => {
          this.indicesService.getIndiceDataBase(row['indiceDB'], row['dataBase'], this.formDefaultValues).then((data) => {
            res(data)
          })
        })

        const getIndiceDataBaseAtual = new Promise((res, rej) => {
          this.indicesService.getIndiceDataBase(row['indiceBA'], row['dataBaseAtual'], this.formDefaultValues).then((data) => {
            res(data)
          })
        })

        Promise.all([getIndiceDataBase, getIndiceDataBaseAtual]).then(resultado => {
          row['indiceDataBase'] = resultado[0]
          row['indiceDataBaseAtual'] = resultado[1]
          if (index > 0) {
            row['valorDevedor'] = this.tableData.dataRows[index - 1]['valorDevedorAtualizado'];
            row['dataBase'] = this.tableData.dataRows[index - 1]['dataBaseAtual'];
          }

          let dias = getQtdDias(formatDate(row["dataBase"]), formatDate(row["dataBaseAtual"]));
          const qtdDias = isVincenda(formatDate(row["dataBase"], 'YYYY-MM-DD'), formatDate(row["dataBaseAtual"], 'YYYY-MM-DD')) ? - dias : dias;

          const valorDevedor = parseFloat(row['valorDevedor']);

          const indiceDataBaseAtual = row['indiceDataBaseAtual'];
          const indiceDataBase = row['indiceDataBase'];

          let correcao;
          if (this.formDefaultValues.formIndice === "Encargos Contratuais %" || row['infoParaCalculo']['formIndice'] === "Encargos Contratuais %") {
            correcao = (valorDevedor * (indiceDataBaseAtual / 100) / 30) * qtdDias
          } else {
            correcao = (valorDevedor / indiceDataBase * indiceDataBaseAtual) - valorDevedor
          }

          const correcaoPeloIndice = row['encargosMonetarios']['correcaoPeloIndice'] = parseFloat(correcao);
          const valorLancado = row['isTipoLancamento'] ? row['lancamentos'] : 0;
          const lancamento = row['tipoLancamento'] === 'credit' ? (valorLancado * (-1)) : valorLancado;

          // -- dias
          row['encargosMonetarios']['jurosAm']['dias'] = qtdDias;
          // -- juros 
          row['encargosMonetarios']['jurosAm']['percentsJuros'] = (((this.formDefaultValues.formJuros) / 30) * qtdDias).toFixed(2);
          // -- moneyValue
          const moneyValue = row['encargosMonetarios']['jurosAm']['moneyValue'] = (((valorDevedor + correcaoPeloIndice) / 30) * qtdDias) * ((this.formDefaultValues.formJuros / 100))

          // -- multa 
          let multa = 0;
          if (index === 0) {
            row['encargosMonetarios']['multa'] = (valorDevedor + correcaoPeloIndice + moneyValue) * (this.formDefaultValues.formMulta / 100);
            multa = (valorDevedor + correcaoPeloIndice + moneyValue) * (this.formDefaultValues.formMulta / 100);
          } else {
            row['encargosMonetarios']['multa'] = "NaN";
          }

          const valorDevedorAtualizado = row['valorDevedorAtualizado'] = valorDevedor + correcaoPeloIndice + moneyValue + multa + lancamento;

          if (this.tableData.dataRows.length - 1 === index) {
            // Forms Total

            this.total_data_calculo = formatDate(this.formDefaultValues.formDataCalculo);
            const honorarios = this.total_honorarios = valorDevedorAtualizado * (this.formDefaultValues.formHonorarios / 100);

            this.last_data_table = getLastLine(this.tableData.dataRows)
            let last_date_base_atual = Object.keys(this.last_data_table).length ? this.last_data_table['dataBaseAtual'] : this.total_date_now;
            let last_date_base = Object.keys(this.last_data_table).length ? this.last_data_table['dataBase'] : this.total_date_now;

            this.subtotal_data_calculo = formatDate(last_date_base);
            this.total_data_calculo = formatDate(last_date_base_atual);
            this.min_data = last_date_base_atual;

            this.total_subtotal = this.last_data_table['valorDevedorAtualizado'];
            const valorDevedorAtualizadoLast = parseFloat(this.last_data_table['valorDevedorAtualizado']);

            this.total_multa_sob_contrato = (valorDevedorAtualizadoLast + honorarios) * this.formDefaultValues.formMultaSobContrato / 100 || 0;
            this.total_grandtotal = this.total_multa_sob_contrato + honorarios + valorDevedorAtualizadoLast;

            if (origin === 'btn') {
              this.alertType = {
                mensagem: 'Cálculo Simulado!',
                tipo: 'success'
              };

              this.formartTable('Simulação');
              this.toggleUpdateLoading()
            }
          }

          this.tableLoading = false;
          !isInlineChange && this.toggleUpdateLoading();
        })
      }, 0);
    });
  }

  deleteRow(row) {
    const index = this.tableData.dataRows.indexOf(row);
    if (!row.id) {
      this.tableData.dataRows.splice(index, 1);
      setTimeout(() => {
        this.simularCalc(true);
        this.alertType = {
          mensagem: 'Registro excluido!',
          tipo: 'danger'
        };
        this.toggleUpdateLoading()
      }, 0)
    } else {
      this.chequeEmpresarialService.removeLancamento(row.id).subscribe(() => {
        this.tableData.dataRows.splice(index, 1);
        setTimeout(() => {
          this.simularCalc(true);
          this.alertType = {
            mensagem: 'Registro excluido!',
            tipo: 'danger'
          };
          this.toggleUpdateLoading()
        }, 0)
      })
    }
  }

  updateInlineIndice(e, row, innerIndice, indiceToChangeInline, columnData) {
    const indice = e.target.value;
    const data = row[columnData];

    const getIndice = new Promise((res, rej) => {
      this.indicesService.getIndiceDataBase(indice, data, this.formDefaultValues).then((data) => {
        res(data)
      })
    })

    Promise.all([getIndice]).then(resultado => {
      row[innerIndice] = indice;
      row[indiceToChangeInline] = resultado[0];

      setTimeout(() => {
        this.simularCalc(true, null, true);
      }, 0);
    })
  }
}