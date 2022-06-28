import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IndicesService } from "../../../_services/indices.service";

import { LISTA_INDICES, LANGUAGEM_TABLE } from "../../util/constants";
import { formatDate, formatCurrency, verifyNumber } from "../../util/util";

declare interface TableData {
  dataRows: Array<Object>;
}

@Component({
  selector: "app-indices",
  templateUrl: "./indices.component.html",
  styleUrls: ["./indices.component.css"],
})
export class IndicesComponent implements OnInit {
  indicesForm: FormGroup;
  tableData: TableData;
  tableLoading = false;
  dtOptions: DataTables.Settings = {};

  indices_field = LISTA_INDICES;
  alertType = {
    mensagem: "",
    tipo: "",
  };

  updateLoading = false;
  request = true;

  listaINPC = [];
  listaCDI = [];
  listaIGPM = [];
  infoTable = {};

  listaAdd = [];

  constructor(
    private formBuilder: FormBuilder,
    private indicesService: IndicesService
  ) {}

  ngOnInit(): void {
    this.indicesForm = this.formBuilder.group({
      indice: ["", Validators.required],
      data: ["", Validators.required],
      valor: ["", Validators.required],
    });

    this.tableData = {
      dataRows: [],
    };

    this.dtOptions = {
      paging: true,
      serverSide: false,
      // ajax: (dataTablesParameters: any, callback) => {
      //   const info = $('#tableIndice').DataTable().page.info();
      //   const indiceType = this.indice_form.indice.value;
      //   const length = dataTablesParameters.length || 10;
      //   const page = info.page || 0;
      //   const draw = dataTablesParameters.draw || 1;

      //   this.indicesService.getIndicePage(indiceType, length, page, draw).subscribe(resp => {
      //     this.tableData.dataRows = resp['data'];

      //     callback({
      //       recordsTotal: resp['recordsTotal'],
      //       recordsFiltered: resp['recordsFiltered'],
      //       pages: resp['recordsTotal'] / resp['length'],
      //       data: []
      //     });
      //   });
      // },
      language: LANGUAGEM_TABLE,
    };
  }

  verifyNumber(value) {
    verifyNumber(value);
  }

  formatCurrency(value) {
    return formatCurrency(value);
  }

  formatDate(value, format = "DD/MM/YYYY") {
    return formatDate(value, format);
  }

  toggleUpdateLoading() {
    this.updateLoading = true;
    setTimeout(() => {
      this.updateLoading = false;
    }, 3000);
  }

  adicionaIndice() {
    this.tableLoading = true;

    const indiceList = [
      {
        indice: this.indice_form.indice.value,
        data: this.indice_form.data.value,
        valor: this.indice_form.valor.value,
      },
    ];

    this.indicesService.addIndice(indiceList).subscribe(
      (resp) => {
        // this.tableData.dataRows.push(indice);
        $("#tableIndice").DataTable().ajax.reload();
        this.indicesForm.reset({ indice: this.indice_form.indice.value });
        this.alertType = {
          mensagem: "Índice incluido!",
          tipo: "success",
        };
        this.toggleUpdateLoading();
      },
      (err) => {
        this.alertType = {
          mensagem: "Registro não incluido!",
          tipo: "danger",
        };
      }
    );

    this.tableLoading = false;
  }

  changeIndices(callback, request = true) {
    if (request) {
      this.tableData.dataRows = [];
      this.tableLoading = true;
      const DATAINPUT = this.indice_form.data.value
        ? formatDate(this.indice_form.data.value, "YYYY-MM-DD")
        : false;

      this.indicesService
        .getIndice(this.indice_form.indice.value)
        .subscribe((indices: any) => {
          this.tableData.dataRows = indices.data;
          this.infoTable = indices;

          setTimeout(() => {
            this.tableLoading = false;
            this.request = false;
          }, 100);
        });
      this.request = true;
    }
  }

  changeIndiceTable(e, row, column) {
    const value =
      column === "valor" ? parseFloat(e.target.value) : e.target.value;
    const index = this.tableData.dataRows.indexOf(row);
    this.tableData.dataRows[index][column] = value;

    this.indicesService
      .updateIndice(row.id, this.tableData.dataRows[index])
      .subscribe(
        (resp) => {
          this.alertType = {
            mensagem: "Índice alterado!",
            tipo: "success",
          };
          this.toggleUpdateLoading();
        },
        (err) => {
          this.alertType = {
            mensagem: "Índice não alterado!",
            tipo: "warning",
          };
          this.toggleUpdateLoading();
        }
      );
  }

  deleteRow(row) {
    this.indicesService.removeIndice(row.id).subscribe(
      (resp) => {
        $("#tableIndice").DataTable().ajax.reload();

        this.alertType = {
          mensagem: "Índice excluido!",
          tipo: "danger",
        };
        this.toggleUpdateLoading();
      },
      (err) => {
        this.alertType = {
          mensagem: "Índice não excluido!",
          tipo: "warning",
        };
      }
    );
  }

  get indice_form() {
    return this.indicesForm.controls;
  }
}
