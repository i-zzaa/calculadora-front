import { Directive, ElementRef, Input, OnInit } from "@angular/core";

@Directive({
  selector: "[parcelaPaga]",
})
export class ParcelaPagaDirective {
  @Input() parcelaPaga: string;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    if (this.parcelaPaga === "Pago") {
      this.el.nativeElement.style.backgroundColor = "#4caf501c";
      this.el.nativeElement.style.color = "#9E9E9E";
    }
  }
}
