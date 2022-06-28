import { Routes } from "@angular/router";

import { ChequeEmpresarialComponent } from "../../pages/cheque-empresarial/cheque-empresarial.component";
import { ParceladoPreComponent } from "../../pages/parcelado-pre/parcelado-pre.component";
import { IndicesComponent } from "../../pages/indices/indices.component";
import { LogComponent } from "../../pages/log/log.component";
import { UserComponent } from "../../pages/user/user.component";

export const AdminLayoutRoutes: Routes = [
  { path: "cheque-empresarial", component: ChequeEmpresarialComponent },
  { path: "parcelado-pre", component: ParceladoPreComponent },
  { path: "parcelado-pos", component: ParceladoPreComponent },
  { path: "indices", component: IndicesComponent },
  { path: "user", component: UserComponent },
  { path: "log", component: LogComponent },
];
