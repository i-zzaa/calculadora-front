import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PastasContratosService } from "../../../_services/pastas-contratos.service";

@Component({
  selector: "app-pesquisa",
  templateUrl: "./pesquisa.component.html",
})
export class PesquisaComponent implements OnInit {
  peForm: FormGroup;
  txtContractRef = "";

  @Input() tableLoading: boolean;
  @Output() contractRef = new EventEmitter();
  @Output() resetForm = new EventEmitter();

  contractList_field = [];
  typeContractList_field = [];
  cnpjList_field = this.agruparPasta("CNPJ");
  clienteList_field = this.agruparPasta("CLIENTE");
  folderData_field = this.agruparPasta("PASTA");

  constructor(
    private formBuilder: FormBuilder,
    private pastasContratosService: PastasContratosService
  ) {}

  ngOnInit(): void {
    this.peForm = this.formBuilder.group({
      pasta: ["", Validators.required],
      contrato: ["", Validators.required],
      tipo_contrato: ["", Validators.required],
      recuperacaoJudicial: [false, Validators.required],
      cliente: ["", Validators.required],
      cnpj: ["", Validators.required],
    });
  }

  setContractRef() {
    const pasta = this.form.pasta.value;
    const contrato = this.form.contrato.value;
    const tipo_contrato = this.form.tipo_contrato.value;
    const recuperacaoJudicial = this.form.recuperacaoJudicial.value;
    const cliente = this.form.cliente.value;
    const cnpj = this.form.cnpj.value;

    this.txtContractRef =
      pasta + contrato + tipo_contrato + recuperacaoJudicial;
    this.resetForm.emit(true);
    const info = {
      pasta,
      contrato,
      tipo_contrato,
      contractRef: this.txtContractRef,
      recuperacaoJudicial,
      cliente,
      cnpj,
    };

    this.contractRef.emit(info);
  }

  agruparPasta(attr) {
    const pastasFiltros = [];

    this.pastas.data.map((pasta) => pastasFiltros.push(pasta[attr]));
    const setUnico = new Set(pastasFiltros);

    return [...setUnico];
  }

  setContrato() {
    this.contractList_field = [];
    this.typeContractList_field = [];

    if (!this.form.cliente.value) {
      this.clienteList_field = [];
    }

    if (!this.form.cnpj.value) {
      this.cnpjList_field = [];
    }

    if (this.form.contrato.value || this.form.tipo_contrato.value) {
      this.peForm.reset({
        pasta: this.form.pasta.value,
        recuperacaoJudicial: false,
      });
    }

    this.pastas.data.map((pasta) => {
      if (pasta.PASTA === this.form.pasta.value) {
        this.contractList_field.push(pasta.CONTRATO);
        this.clienteList_field.push(pasta.CLIENTE);
        this.cnpjList_field.push(pasta.CNPJ);
      }
    });

    const setUnico = new Set(this.contractList_field);
    this.contractList_field = [...setUnico];

    const setUnicoCliente = new Set(this.clienteList_field);
    this.clienteList_field = [...setUnicoCliente];

    const setUnicoCNPJ = new Set(this.cnpjList_field);
    this.cnpjList_field = [...setUnicoCNPJ];
  }

  setTypeContract() {
    this.typeContractList_field = [];
    this.peForm.value.tipo_contrato = "";

    if (this.form.tipo_contrato.value) {
      this.peForm.reset({
        pasta: this.form.pasta.value,
        contrato: this.form.contrato.value,
        recuperacaoJudicial: false,
      });
    }

    this.pastas.data.map((pasta) => {
      if (
        pasta.PASTA === this.form.pasta.value &&
        pasta.CONTRATO === this.form.contrato.value
      ) {
        this.typeContractList_field.push(pasta.DESCRICAO);
      }
    });

    const setUnico = new Set(this.typeContractList_field);
    this.typeContractList_field = [...setUnico];
  }

  setCliente() {
    if (!this.form.pasta.value) {
      this.folderData_field = [];
      this.contractList_field = [];
      this.typeContractList_field = [];

      if (this.form.contrato.value || this.form.tipo_contrato.value) {
        this.peForm.reset({
          pasta: this.form.pasta.value,
          recuperacaoJudicial: false,
        });
      }
    }

    if (!this.form.cnpj.value) {
      this.cnpjList_field = [];
    }

    this.pastas.data.map((pasta) => {
      if (pasta.CLIENTE === this.form.cliente.value) {
        this.contractList_field.push(pasta.CONTRATO);
        this.folderData_field.push(pasta.PASTA);
        this.cnpjList_field.push(pasta.CNPJ);
      }
    });

    const setUnico = new Set(this.contractList_field);
    this.contractList_field = [...setUnico];

    const setUnicoCliente = new Set(this.folderData_field);
    this.folderData_field = [...setUnicoCliente];

    const setUnicoCNPJ = new Set(this.cnpjList_field);
    this.cnpjList_field = [...setUnicoCNPJ];
  }

  setCnpj() {
    if (this.form.pasta.value === "") {
      this.folderData_field = [];
      this.contractList_field = [];
      this.typeContractList_field = [];

      if (this.form.contrato.value || this.form.tipo_contrato.value) {
        this.peForm.reset({
          pasta: this.form.pasta.value,
          recuperacaoJudicial: false,
        });
      }
    }

    if (this.form.cliente.value === "") {
      this.clienteList_field = [];
    }

    this.pastas.data.map((pasta) => {
      if (pasta.CNPJ === this.form.cnpj.value) {
        if (!this.form.cliente.value) {
          this.clienteList_field.push(pasta.CLIENTE);
        }

        if (!this.form.pasta.value) {
          this.contractList_field.push(pasta.CONTRATO);
          this.folderData_field.push(pasta.PASTA);
        }
      }
    });

    const setUnico = new Set(this.contractList_field);
    this.contractList_field = [...setUnico];

    const setUnicoCliente = new Set(this.clienteList_field);
    this.clienteList_field = [...setUnicoCliente];

    const setUnicoPasta = new Set(this.folderData_field);
    this.folderData_field = [...setUnicoPasta];
  }

  get pastas(): any {
    return this.pastasContratosService.getPastas();
  }
  get form() {
    return this.peForm.controls;
  }
}
