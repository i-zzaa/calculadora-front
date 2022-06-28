import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./_guards/auth.guard";
import { LoginComponent } from "./_component/login/login.component";
import { AdminLayoutComponent } from "./_component/layouts/admin-layout/admin-layout.component";
import { UserComponent } from "./_component/pages/user/user.component";
import { ChequeEmpresarialComponent } from "./_component/pages/cheque-empresarial/cheque-empresarial.component";
import { ParceladoPreComponent } from "./_component/pages/parcelado-pre/parcelado-pre.component";
import { IndicesComponent } from "./_component/pages/indices/indices.component";
import { LogComponent } from "./_component/pages/log/log.component";

const routes: Routes = [
  {
    path: "",
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "user",
        component: UserComponent,
      },
      {
        path: "cheque-empresarial",
        component: ChequeEmpresarialComponent,
      },
      {
        path: "parcelado-pos",
        component: ParceladoPreComponent,
      },
      {
        path: "parcelado-pre",
        component: ParceladoPreComponent,
      },
      {
        path: "indices",
        component: IndicesComponent,
      },
      {
        path: "log",
        component: LogComponent,
      },
      { path: "", redirectTo: "/", pathMatch: "full" },
    ],
  },
  {
    path: "login",
    component: LoginComponent,
  },
  { path: "", redirectTo: "/login", pathMatch: "full" },
  { path: "**", redirectTo: "/login" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
