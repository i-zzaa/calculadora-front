import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../../../_services/user.service";
import { User } from "../../../_models/user";

@Component({ templateUrl: "user.component.html" })
export class UserComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  errorMessage = "";
  payload: User;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      user_name: ["", Validators.required],
      status: ["", Validators.required],
      profile: ["", Validators.required],
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.userForm.controls;
  }

  resetFields() {
    this.userForm.reset();
  }

  addUser() {
    // stop here if form is invalid
    if (this.userForm.invalid) {
      return;
    }

    this.loading = true;

    this.payload = {
      username: this.f.user_name.value,
      status: this.f.status.value,
      profile: this.f.profile.value,
      createdDate: new Date(),
    };

    this.userService.addUser(this.payload).subscribe(
      (data) => {
        // TODO: Plmdds
        location.reload();
        this.resetFields();
      },
      (err) => {
        this.errorMessage = err.error.title;
        this.loading = false;
      }
    );
  }
}
