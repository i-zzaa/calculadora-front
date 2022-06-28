import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-notificacao",
  templateUrl: "./notificacao.component.html",
  styleUrls: ["./notificacao.component.css"],
})
export class NotificacaoComponent implements OnInit {
  @Input() mensagem: string;
  @Input() show: boolean;
  @Input() tipo: string;

  updateLoading = false;

  constructor() {}

  ngOnInit(): void {}

  toggleUpdateLoading() {
    this.updateLoading = true;
    setTimeout(() => {
      this.updateLoading = false;
    }, 5000);
  }
}
