import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { retry, catchError } from "rxjs/operators";
import { LoginResponse } from "../_models/user";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  // API de autenticação parametrizada
  AUTH_PATH: string = environment.AUTH_PATH;

  constructor(private router: Router, private http: HttpClient) {}

  HTTP_HEADER = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
    }),
  };

  // Handle erros da api
  handleError(error: HttpErrorResponse) {
    console.log("error", error);
    return throwError(
      "Ocorreu um erro ao realizar a requisição. Tente novamente mais tarde!"
    );
  }

  // Login e token
  login(data): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.AUTH_PATH}/login`, data, this.HTTP_HEADER)
      .pipe(retry(2), catchError(this.handleError));
  }

  // Salva usuário no localStorage
  setUser(response: LoginResponse) {
    localStorage.setItem("username", response.user.username);
    localStorage.setItem("token", response.token);
    this.router.navigate(["/"]);
  }

  /* Checa login
		No exemplo, o método de token (exemplo:jwt) é usado
		Trocar por verificação de login configurado no backend
	*/
  isLoggedIn() {
    return !!localStorage.getItem("token");
  }

  // Remove usuário do localStorage
  logout() {
    localStorage.clear();
    this.router.navigate(["/login"]);
  }

  // Recupera dados de API para o Dashboard
  getData(data): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.AUTH_PATH}/login`, data, this.HTTP_HEADER)
      .pipe(retry(2), catchError(this.handleError));
  }
}
