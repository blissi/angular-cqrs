import {Injectable, OnDestroy, Optional} from "@angular/core";
import * as dottie from "dottie";
import * as uuid from "uuid/v4";


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


export type CommandSender = (cmd: any) => void;
export type EventHandler = (evt: any) => void;


@Injectable()
export class CQRSService implements OnDestroy {
	private config: CQRSServiceConfig;
	private cmdHandler: CommandSender | undefined;
	private cmdCallbacks: any = {};
	
	public constructor(@Optional() config: CQRSServiceConfig) {
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
	}
	
	/**
	 * @description
	 * Used to call Angular CQRS from your application, i.e. if a specific websocket message arrived.
	 *
	 * @param {object} evt The received event
	 */
	public eventReceived(evt: any): void {
		if (!evt)
			return;
		
		const commandId = dottie.get(evt, this.config.eventDefinition.commandId, null);
		if (commandId && this.cmdCallbacks[commandId]) {
			const listener: EventHandler = this.cmdCallbacks[commandId];
			delete this.cmdCallbacks[commandId];
			listener(evt);
		}
	}
	
	/**
	 * @description
	 * Sends a command using the function registered by onCommand.
	 *
	 * @param {object} cmd The command object to send to the backend
	 * @param {function} listener A optional callback function that is invoked once, as soon as the correspondant event returns from the server.
	 */
	public sendCommand(cmd: any, listener?: EventHandler): void {
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