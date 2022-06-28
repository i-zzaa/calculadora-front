import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { environment } from "../../environments/environment";
import { User } from "../_models/user";

@Injectable({ providedIn: "root" })
export class UserService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<User[]>(`${environment.API_PATH}/users`);
  }

  getById(id: number) {
    return this.http.get<User[]>(`${environment.API_PATH}/users/${id}`);
  }

  addUser(payload: User) {
    return this.http.post(`${environment.API_PATH}/users`, payload);
  }

  updateUser(payload: User) {
    return this.http.put(
      `${environment.API_PATH}/users/${payload.id}`,
      payload
    );
  }

  removeUser(id: number) {
    return this.http.delete(`${environment.API_PATH}/users/${id}`);
  }
}
