import {ModuleWithProviders, NgModule, Optional, SkipSelf} from "@angular/core";
import {CommonModule} from "@angular/common";
import {CQRSService, CQRSServiceConfig} from "./CQRS.service";


@NgModule({
	imports: [CommonModule],
	providers: []
})
export class CQRSModule {
	
	constructor(@Optional() @SkipSelf() parentModule: CQRSModule) {
		if (parentModule) {
			throw new Error("CQRSModule is already loaded. Import it in the AppModule only.");
		}
	}
	
	public static forRoot(config: CQRSServiceConfig): ModuleWithProviders {
		return {
			ngModule: CQRSModule,
			providers: [
				{
					provide: CQRSService,
					useValue: config
				}
			]
		};
	}
}