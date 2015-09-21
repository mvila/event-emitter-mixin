# event-emitter-mixin [![Build Status](https://travis-ci.org/mvila/event-emitter-mixin.svg?branch=master)](https://travis-ci.org/mvila/event-emitter-mixin)

Event emitter mixin using ES7 decorators.

Features:
- Usual `on()`, `off()` and `emit()` methods.
- Listeners can be defined at any level in the prototype chain. Thus, a listener defined in the prototype of a class will be shared by all instances of that class.
- Listeners can be ES7 `async` functions and it is possible to wait their completion using the `await` keyword.

## Installation

```
npm install --save event-emitter-mixin
```

## Usage

### Basic usage

```javascript
import EventEmitter from 'event-emitter-mixin';

@EventEmitter
class Person {
  // ...
}

let person = new Person();

person.on('event', function() {
  // ...
});

person.emit('event');
```

### Listener defined on a class prototype

```javascript
import EventEmitter, { on } from 'event-emitter-mixin';

@EventEmitter
class Person {
  @on event() {
    // ...
  }
}

let person = new Person();

person.emit('event');
```

### Async listeners

```javascript
import EventEmitter, { on } from 'event-emitter-mixin';

@EventEmitter
class Person {
  @on async event() {
    // ...
  }
}

let person = new Person();

person.on('event', async function() {
  // ...
});

await person.emit('event');
```

## License

MIT
