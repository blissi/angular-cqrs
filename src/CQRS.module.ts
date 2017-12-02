import {ModuleWithProviders, NgModule} from "@angular/core";
import { CommonModule } from '@angular/common';
import {CQRSService, CQRSServiceConfig} from "./CQRS.service";

@NgModule({
	imports: [CommonModule],
	providers: [
		CQRSService
	]
})
export class CQRSModule {
	
	public static forRoot(config: CQRSServiceConfig): ModuleWithProviders {
		return {
			ngModule: CQRSModule,
			providers: [
				{
					provide: CQRSService,
					useValue: config
				}
			]
		}
	}
}