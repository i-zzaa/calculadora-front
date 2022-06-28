import { Directive, ElementRef, Input, OnInit } from "@angular/core";

@Directive({
  selector: "[footer]",
})
export class FooterDirective implements OnInit {
  @Input() footer: string;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.el.nativeElement.style.backgroundColor = "#e9ecef";
    this.el.nativeElement.style.textAlign = this.footer || "center";
  }
}
