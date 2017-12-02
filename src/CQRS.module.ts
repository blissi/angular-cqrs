import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import {CQRSService} from "./CQRS.service";

@NgModule({
	imports: [CommonModule],
	providers: [
		CQRSService
	]
})
export class CQRSModule {
}