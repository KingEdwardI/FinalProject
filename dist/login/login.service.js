"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var api_service_1 = require("../api.service");
var list_view_service_1 = require("../myList/list-view.service");
var savedList_service_1 = require("../savedList/savedList.service");
var LoginService = (function () {
    function LoginService(router, apiService, listViewService, savedListService) {
        this.router = router;
        this.apiService = apiService;
        this.listViewService = listViewService;
        this.savedListService = savedListService;
        this.authenticated = false;
    }
    LoginService.prototype.authenticate = function (path, creds) {
        return this.apiService.post("/" + path, JSON.stringify(creds))
            .do(function (response) {
            if (response.status === "success") {
                this.authenticated = true;
                this.user = response.userInfo;
                this.listViewService.loadUserLists();
                this.savedListService.loadSavedLists();
            }
            this.router.navigate(['/mylist']);
        }.bind(this));
    };
    LoginService.prototype.deauthenticate = function () {
        this.authenticated = false;
        this.user = null;
        this.router.navigate(['login']);
        this.apiService.post('/logout', "")
            .subscribe(function (res) {
            this.listViewService.lists = [];
            this.savedListService.savedLists = [];
            console.log(res);
        }.bind(this));
    };
    LoginService.prototype.editUser = function (user) {
        return this.apiService.post("/edit-user", JSON.stringify(user))
            .do(function (response) {
            this.user = response;
        }.bind(this));
    };
    LoginService.prototype.canActivate = function () {
        if (!this.authenticated) {
            this.router.navigate(['login']);
        }
        return this.authenticated;
    };
    LoginService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [router_1.Router, api_service_1.ApiService, list_view_service_1.ListViewService, savedList_service_1.SavedListService])
    ], LoginService);
    return LoginService;
}());
exports.LoginService = LoginService;
//# sourceMappingURL=login.service.js.map