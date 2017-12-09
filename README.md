# angular-cqrs
Provides CQRS functionality for Angular 2/4.

## Usage

### Import the Angular module
```javascript
@NgModule({
    imports: [
        CQRSModule.forRoot({
            eventDefinition: {
                name: "event"
            },

            commandDefinition: {
                name: "command"
            }
        })
    ],
    ...
})
export class AppModule {
    ...
```


### Wire up events and commands

```javascript
export class AppModule {
    constructor(cqrsService: CQRSService, socket: SocketService) {
        cqrsService.onCommand(cmd => {
            socket.sendCommand(cmd);
        });

        socket.receive("event").subscribe(evt => {
            cqrsService.eventReceived(evt);
        });
    }
}
```

This allows you to connect the CQRS service with the transportation to the backend - in this case a websocket.


### Send a command

```javascript
const cmd: {
    command: "mycommand",
    ...     // Any arbitrary data, for example aggregate infos, command payload, meta infos, ...
};
cqrsService.sendCommand(cmd);
```


### React to events

```javascript
cqrsService.$events.subscribe(evt => {
    console.log("Received event: " + evt.event);
});
```