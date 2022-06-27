import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { HttpClientModule } from "@angular/common/http";
import { LoginComponent } from "./_component/login/login.component";
import { UserComponent } from "./_component/pages/user/user.component";
import { TableComponent } from "./_component/pages/table/table.component";
import { ChequeEmpresarialComponent } from "./_component/pages/cheque-empresarial/cheque-empresarial.component";
import { ParceladoPreComponent } from "./_component/pages/parcelado-pre/parcelado-pre.component";
("./_component/pages/parcelado-pre/parcelado-pre.component");
import { AdminLayoutComponent } from "./_component/layouts/admin-layout/admin-layout.component";

import { SidebarModule } from "./_component/sidebar/sidebar.module";
import { NavbarModule } from "./_component/navbar/navbar.module";
import { ToastrModule } from "ngx-toastr";

import { DataTablesModule } from "angular-datatables";
import { IndicesComponent } from "./_component/pages/indices/indices.component";
import { LogComponent } from "./_component/pages/log/log.component";
import { PesquisaComponent } from "./_component/pages/pesquisa/pesquisa.component";
import { SimulacaoComponent } from "./_component/pages/simulacao/simulacao.component";
import { NotificacaoComponent } from "./_component/pages/notificacao/notificacao.component";
import { ParcelasComponent } from "./_component/pages/parcelas/parcelas.component";
import { AmortizacaoComponent } from "./_component/pages/amortizacao/amortizacao.component";
import { CallbackPipe } from "./_pipe/callback.pipe";
import { VincendasDirective } from "./_directive/vincendas.directive";
import { FooterDirective } from "./_directive/footer.directive";
import { NgSelectModule } from "@ng-select/ng-select";
import { ParcelaPagaDirective } from "./_directive/parcela-paga.directive";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserComponent,
    TableComponent,
    AdminLayoutComponent,
    ChequeEmpresarialComponent,
    ParceladoPreComponent,
    IndicesComponent,
    LogComponent,
    PesquisaComponent,
    SimulacaoComponent,
    NotificacaoComponent,
    ParcelasComponent,
    AmortizacaoComponent,
    CallbackPipe,
    VincendasDirective,
    FooterDirective,
    ParcelaPagaDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarModule,
    NavbarModule,
    ToastrModule.forRoot(),
    DataTablesModule,
    NgSelectModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
