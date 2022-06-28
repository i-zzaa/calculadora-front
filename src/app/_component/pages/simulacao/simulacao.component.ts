import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { getCurrentDate, verifyNumber, formatDate } from "../../util/util";
import {
  LISTA_INDICES,
  ENCARGOS,
  PARCELADO_PRE_URL,
} from "../../util/constants";

@Component({
  selector: "app-simulacao",
  templateUrl: "./simulacao.component.html",
})
export class SimulacaoComponent implements OnInit {
  formRiscos: FormGroup;
  @Input() updateLoadingBtn: boolean;
  @Input() tableDataLength: boolean;
  @Input() isDesagio: boolean;
  @Input() ultimaAtualizacao: string;

  @Output() formValue = new EventEmitter();
  @Output() simularCalculo = new EventEmitter();
  @Output() salvar = new EventEmitter();

  indice_field = LISTA_INDICES;
  isEncargo: boolean;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.formRiscos = this.formBuilder.group({
      formDataCalculo: getCurrentDate("YYYY-MM-DD"),
      formUltimaAtualizacao: "",
      formMulta: [],
      formJuros: [],
      formHonorarios: [],
      formMultaSobContrato: [],
      formIndice: [],
      formIndiceEncargos: [],
      formDesagio: [],
    });

    this.isEncargo = this.form_riscos.formIndice.value === ENCARGOS;
  }

  ngAfterViewInit() {
    this.formRiscos.value.formUltimaAtualizacao = formatDate(
      this.ultimaAtualizacao,
      "YYYY-MM-DD"
    );
  }

  simular() {
    this.simularCalculo.emit();
  }

  atualizarRisco() {
    this.formRiscos.value.formUltimaAtualizacao = getCurrentDate("YYYY-MM-DD");
    this.salvar.emit();
  }

  resetForm(e) {
    this.formRiscos.reset({ formDataCalculo: getCurrentDate("YYYY-MM-DD") });
    setTimeout(() => {
      this.changeInput(e);
    }, 100);
  }

  validarNumeros(e) {
    verifyNumber(e.target.value);
    this.changeInput(e);
  }

  changeInput(e = null) {
    this.isEncargo = this.form_riscos.formIndice.value === ENCARGOS;
    this.formValue.emit(this.formRiscos.value);
  }

  get form_riscos() {
    return this.formRiscos.controls;
  }
}
