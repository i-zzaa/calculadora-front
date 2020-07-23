import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { isVincenda } from '../_component/util/util'
import { CHEQUE_EMPRESARIAL } from '../_component/util/constants'


@Directive({
  selector: '[vincendas]'
})
export class VincendasDirective implements OnInit {
  @Input() vincendas: any;


  constructor(private el: ElementRef) { }


  ngOnInit() {
    const valid = this.vincendas?.modulo === CHEQUE_EMPRESARIAL ? !this.vincendas.isTipoLancamento : this.vincendas;
    if (valid) {
      if (this.el.nativeElement.localName === "select" || this.el.nativeElement.localName === "input") {
        this.el.nativeElement.style.backgroundColor = 'transparent';
        return;
      }
      
      this.el.nativeElement.style.backgroundColor = '#f4f3ef';
    }

  }

}
