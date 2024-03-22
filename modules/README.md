# About transport loggers

> [!TIP]
>
> Here we will talk about [existing transport loggers](#fslogger-api) and we
> [will create a new one](#custom-transport).

## Default transports

### FSLogger API

Winchester logging transport, with out of the box optimizations.

<div align="center">

#### Options

|      Option       | Description                                          |  Default   |
| :---------------: | ---------------------------------------------------- | :--------: |
| **writeInterval** | How often you logs would be flushed to winchester    |   **3s**   |
|  **bufferSize**   | Maximum size of flush size                           |  **64kb**  |
|     **path**      | Path to log directory                                | **./logs** |
|     **keep**      | Log file time span, 0 means infinite                 |   **3**    |
|    **silence**    | Runtime errors wouldn't be emitted by this transport | **false**  |
|    **locale**     | Filename Intl date locale                            |   **af**   |

</div>

### Console API

Transport logs to the console.

<div align="center">

#### Options

|   Option   | Description                        |         Default         |
| :--------: | ---------------------------------- | :---------------------: |
| **pretty** | Pretty function                    | **(log,obj)=>log+'\n'** |
| **stdout** | Output interface with method write |   **process.stdout**    |

</div>

### Browser API

Transport logs to browser console.

> [!TIP]
>
> By default, in the browser, transport uses corresponding
> [Log4j](https://en.wikipedia.org/wiki/Log4j) console methods (`error`, `warn`, `info`, `debug`,
> `trace`) and uses console.error for any fatal level logs. Other levels will be passed to `log`
> method.

<div align="center">

#### Options

No options yet available

</div>

## Custom transport

To create custom transport you only need to follow contract:

```ts
interface CustomTransport {
  write: (log: string) => void;
  start?: () => Promise<void>;
  finish?: () => Promise<void>;
  on?: (event: string, callback: ('event', ...args: unknown[]) => void) => CustomTransport;
}
```

<div align="center">

### Methods

| Method     | Description                                                                                                                                                                                                           |
| :--------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **on**     | You can extend your transport from EventEmitter implementation, or create custom methods after all - if Transport will be created with method `on`, Logger will listen for error messages and will pass them through; |
| **write**  | The only method that required, Logger will pass logs through this method                                                                                                                                              |
| **finish** | Used as destructor function for your transport, would be called by Logger if specific method is called from Logger. If you use long term functions - this is great place to clean up memory and processes.            |
| **start**  | Used as constructor function for your transport, would be called by Logger when it will start all jobs. If you use long term function - this is great place to init those.                                            |

</div>

### Example

```js
'use strict';

module.exports = Console;

const kOptions = Symbol('nalogy:console:options');
const OPTIONS = {
  pretty: log => log + '\n',
  stdout: process.stdout,
};

function Console(options = {}) {
  this[kOptions] = { ...OPTIONS, ...options };
}

Console.prototype.write = function (log) {
  const { pretty, stdout } = this[kOptions];
  stdout.write(pretty(log));
};
```
