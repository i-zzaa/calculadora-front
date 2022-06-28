import { Component, OnInit } from "@angular/core";
import { UserService } from "../../../_services/user.service";
import { User } from "../../../_models/user";

declare interface TableData {
  headerRow: string[];
  dataRows: Object[];
}

@Component({
  selector: "table-cmp",
  moduleId: module.id,
  templateUrl: "table.component.html",
})
export class TableComponent implements OnInit {
  constructor(private userService: UserService) {}

  public myModel: any;
  public tableData: TableData;
  public errorMessage: string;
  public tableLoading = false;

  ngOnInit() {
    this.buildDataTable();
  }

  buildDataTable() {
    this.tableLoading = true;
    this.userService.getAll().subscribe(
      (userList) => {
        this.tableData = {
          headerRow: ["Data de criação", "Nome", "Perfil", "Status", ""],
          dataRows: userList.reverse(),
        };
        this.tableLoading = false;
      },
      (err) => {
        this.errorMessage = err.error.message;
      }
    );
  }

  formatDate(createdDate: Date) {
    const timestamp = Date.parse(createdDate.toString());
    const date = new Date(timestamp).toJSON();
    const formatedDate = date
      .slice(0, 10)
      .split("-")
      .reverse()
      .join("/")
      .concat(" ")
      .concat(date.slice(11, 16));

    return formatedDate;
  }

  updateUser(payload: User) {
    this.userService.updateUser(payload).subscribe(
      () => {
        // TODO: Plmdds
        location.reload();
      },
      (err) => {
        this.errorMessage = err.error.title;
        // this.loading = false;
      }
    );
  }

  updateName(event: any, payload: User) {
    const localUsername = event.target.innerText;

    // Verify changes
    if (payload.username === localUsername) {
      return false;
    }

    const localPayload = { ...payload };
    localPayload.username = localUsername;

    this.updateUser(localPayload);
  }

  updateSelect(event: any, payload: User, attr: string, ref: string) {
    const localPayload = { ...payload };
    localPayload[attr] = event.target[ref];
    localPayload.status = localPayload.status === "true";

    this.updateUser(localPayload);
  }

  deleteUser(payload: User) {
    this.userService.removeUser(payload.id).subscribe(
      () => {
        // TODO: Plmdds
        location.reload();
      },
      (err) => {
        this.errorMessage = err.error.message;
      }
    );
  }
}
