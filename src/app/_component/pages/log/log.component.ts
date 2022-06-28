import { Component, OnInit, ViewChild } from "@angular/core";
import { LogService } from "../../../_services/log.service";
import * as moment from "moment";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PastasContratosService } from "../../../_services/pastas-contratos.service";
import { DataTableDirective } from "angular-datatables";
import "datatables.net";
import "datatables.net-buttons";

import { formatDate, formatCurrency, verifyNumber } from "../../util/util";
import { LANGUAGEM_TABLE } from "../../util/constants";

declare interface TableData {
  dataRows: Array<Object>;
}

@Component({
  selector: "app-log",
  templateUrl: "./log.component.html",
})
export class LogComponent implements OnInit {
  tableLoading = false;
  updateLoading = false;
  alertType = {
    mensagem: "",
    tipo: "",
  };
  row: [];
  infoContrato = {
    pasta: "",
    contrato: "",
    tipo_contrato: "",
    recuperacaoJudicial: false,
  };

  tableData: TableData;
  dtOptions: DataTables.Settings = {};

  @ViewChild(DataTableDirective)
  datatableElement: DataTableDirective;

  logForm: FormGroup;

  constructor(
    private logService: LogService,
    private formBuilder: FormBuilder,
    private pastasContratosService: PastasContratosService
  ) {}

  ngOnInit(): void {
    this.logForm = this.formBuilder.group({
      log_pasta: ["", Validators.required],
      log_contrato: ["", Validators.required],
      log_tipo_contrato: ["", Validators.required],
    });

    this.tableData = {
      dataRows: [],
    };
    this.dtOptions = {
      paging: true,
      scrollCollapse: true,
      language: LANGUAGEM_TABLE,
      processing: true,
      drawCallback: (settings) => {
        const tr = $(this).closest("tr");
      },
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        // Unbind first in order to avoid any duplicate handler
        // (see https://github.com/l-lin/angular-datatables/issues/87)

        $(".details-control", row).unbind("click");
        $(".details-control", row).bind("click", (el: any) => {
          this.datatableElement.dtInstance.then(
            (dtInstance: DataTables.Api) => {
              const selectedRow = dtInstance.row($(row));

              el.currentTarget.children[0].classList.toggle("nc-minimal-right");
              el.currentTarget.children[0].style.color =
                el.currentTarget.children[0].style.color === "red"
                  ? "green"
                  : "red";
              el.currentTarget.children[0].classList.toggle("nc-minimal-down");

              if (selectedRow.child.isShown()) {
                selectedRow.child.hide();
              } else {
                selectedRow.child(this.detailsRow(this.row)).show();
              }
            }
          );
        });
        return row;
      },
      // ajax: (dataTablesParameters: any, callback) => {
      //   const info = $('#tableLog').DataTable().page.info();
      //   const length = dataTablesParameters.length || 10;
      //   const page = info.page || 0;
      //   const draw = dataTablesParameters.draw || 1;

      //   this.logService.getLogPage(
      //     this.infoContrato.pasta,
      //     this.infoContrato.contrato,
      //     this.infoContrato.tipo_contrato,
      //     length,
      //     page,
      //     draw,
      //     this.infoContrato.recuperacaoJudicial
      //   ).subscribe(logs => {
      //     this.tableData.dataRows = logs['data'];

      //     callback({
      //       recordsTotal: logs['recordsTotal'],
      //       recordsFiltered: logs['recordsFiltered'],
      //       pages: logs['recordsTotal'] / logs['length'],
      //       data: []
      //     });
      //   });
      // },
    };
  }

  formatCurrency(value) {
    return formatCurrency(value);
  }

  verifyNumber(value) {
    verifyNumber(value);
  }

  formatDate(value, format = "DD/MM/YYYY") {
    return formatDate(value, format);
  }

  toggleDetails(row) {
    this.row = row.infoTabela;
  }

  detailsRow(item: any) {
    const tableCheque = item;
    return tableCheque;
  }

  toggleUpdateLoading() {
    this.updateLoading = true;
    setTimeout(() => {
      this.updateLoading = false;
    }, 5000);
  }

  pesquisarContratos(infoContrato) {
    this.tableLoading = true;
    this.infoContrato = infoContrato;
    this.tableData.dataRows = [];

    this.logService
      .getLog(
        this.infoContrato.pasta,
        this.infoContrato.contrato,
        this.infoContrato.tipo_contrato,
        this.infoContrato.recuperacaoJudicial
      )
      .subscribe(
        (logs: any) => {
          if (!logs.data.length) {
            this.alertType = {
              mensagem: "Nenhuma registro encontrado!",
              tipo: "warning",
            };

            this.tableLoading = false;
            this.toggleUpdateLoading();
            return;
          }

          this.tableData.dataRows = logs.data;
          this.tableLoading = false;
        },
        (err) => {
          this.alertType = {
            mensagem: "Nenhuma registro encontrado!",
            tipo: "warning",
          };
          this.tableLoading = false;
          this.toggleUpdateLoading();
        }
      );
  }

  get log_form() {
    return this.logForm.controls;
  }
}
