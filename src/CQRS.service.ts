import {Inject, Injectable, InjectionToken, OnDestroy, Optional} from "@angular/core";
import * as dottie from "dottie";
import * as uuid from "uuid/v4";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";


export interface CQRSServiceConfig {
	eventDefinition?: {
		/**
		 * name property of the events. Default: "event".
		 */
		name?: string,
		
		/**
		 * property of the events that contains the id of the command that initiated this event. Default: "commandId".
		 */
		commandId?: string
	},
	
	commandDefinition?: {
		/**
		 * id property of the commands. Default: "id".
		 */
		id?: string,
		
		/**
		 * name property of the commands. Default: "command".
		 */
		name?: string
	}
}


export const CQRS_CONFIG = new InjectionToken("CQRS_CONFIG");


export type CommandSender = (cmd: any) => void;
export type CommandCallback = (evt: any, done: () => void) => void;


@Injectable()
export class CQRSService implements OnDestroy {
	private config: CQRSServiceConfig;
	private cmdHandler: CommandSender | undefined;
	private cmdCallbacks: any = {};
	private readonly _$events = new Subject<any>();
	
	public constructor(@Optional() @Inject(CQRS_CONFIG) config: CQRSServiceConfig) {
		this.config = config || {};
		
		this.config.eventDefinition = this.config.eventDefinition || {};
		this.config.eventDefinition.name = this.config.eventDefinition.name || "event";
		this.config.eventDefinition.commandId = this.config.eventDefinition.commandId || "commandId";
		
		this.config.commandDefinition = this.config.commandDefinition || {};
		this.config.commandDefinition.id = this.config.commandDefinition.id || "id";
		this.config.commandDefinition.name = this.config.commandDefinition.name || "command";
	}
	
	public ngOnDestroy(): void {
		this.cmdCallbacks = {};
		this.cmdHandler = undefined;
		this._$events.complete();
	}
	
	/**
	 * Used to call Angular CQRS from your application, i.e. if a specific websocket message arrived.
	 *
	 * @param {object} evt The received event
	 */
	public eventReceived(evt: any): void {
		if (!evt)
			return;
		
		const commandId = dottie.get(evt, this.config.eventDefinition.commandId, null);
		if (commandId && this.cmdCallbacks[commandId]) {
			const listener: CommandCallback = this.cmdCallbacks[commandId];
			
			// done removes the command callback.
			const done = () => {
				delete this.cmdCallbacks[commandId];
			};
			
			listener(evt, done);
		}
		
		this._$events.next(evt);
	}
	
	/**
	 * This observable is invoked for every event that is received.
	 */
	public get $events(): Observable<any> {
	    return this._$events.asObservable();
	}
	
	/**
	 * Sends a command using the function registered by onCommand.
	 *
	 * @param {object} cmd The command object to send to the backend
	 * @param {function} listener An optional callback function that is invoked as soon as the correspondant event returns from the server.
	 * The signature of this listener is (evt: any, done: () => void) => void. You must call done() if this is the only event and
	 * you are not interested in further events that belong to this command.
	 */
	public sendCommand(cmd: any, listener?: CommandCallback): void {
		const id = this.fillCommandIdIfNotPresent(cmd);
		
		if (listener) {
			if (this.cmdCallbacks[id]) {
				throw new Error("The command with this id has already been sent. Please make sure that the command ids are unique.");
			}
			
			this.cmdCallbacks[id] = listener;
		}
		
		if (this.cmdHandler)
			this.cmdHandler(cmd);
	}
	
	private fillCommandIdIfNotPresent(cmd: any): string {
		let id = dottie.get(cmd, this.config.commandDefinition.id, null);
		if (!id) {
			id = uuid().toString();
			dottie.set(cmd, this.config.commandDefinition.id, id);
		}
		
		return id;
	}
	
	/**
	 * @description
	 * Used to register a channel over which Angular CQRS commands will be sent, i.e. websocket connection.
	 *
	 * @param {function} sender The function with which the command should be sent.
	 */
	public onCommand(sender: CommandSender): void {
		this.cmdHandler = sender;
	}
}