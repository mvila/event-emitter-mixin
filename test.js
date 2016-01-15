'use strict';

import { assert } from 'chai';
import sleep from 'sleep-promise';
import { EventEmitterMixin, on } from './src';

describe('EventEmitterMixin', function() {
  describe('#on() and #emit()', function() {
    it('should work on an instance', function() {
      class Person extends EventEmitterMixin() {}
      let person = new Person();
      let hasBeenCalledWith;
      person.on('event', function(value) {
        hasBeenCalledWith = value;
      });
      person.emit('event', 123);
      assert.equal(hasBeenCalledWith, 123);
    });

    it('should work on a prototype', function() {
      let hasBeenCalledWith;
      class Person extends EventEmitterMixin() {
        @on event(value) {
          hasBeenCalledWith = value;
        }
      }
      let person = new Person();
      person.emit('event', 123);
      assert.equal(hasBeenCalledWith, 123);
    });

    it('should work on both an instance and a prototype', function() {
      let prototypeHasBeenCalled = false;
      class Person extends EventEmitterMixin() {
        @on event() {
          prototypeHasBeenCalled = true;
        }
      }
      let person = new Person();
      let instanceHasBeenCalled = false;
      person.on('event', function() {
        instanceHasBeenCalled = true;
      });
      person.emit('event');
      assert.isTrue(instanceHasBeenCalled);
      assert.isTrue(prototypeHasBeenCalled);
    });

    it('should work with several listeners on different prototypes', function() {
      let hasBeenCalledCounter = 0;
      class Human extends EventEmitterMixin() {
        @on event() {
          hasBeenCalledCounter++;
        }
      }
      class Person extends Human {
        @on event() {
          hasBeenCalledCounter++;
        }
      }
      let person = new Person();
      person.emit('event');
      assert.equal(hasBeenCalledCounter, 2);
    });

    it('should work with an async listener', async function() {
      class Person extends EventEmitterMixin() {}
      let person = new Person();
      let hasBeenCalled;
      person.on('event', async function() {
        await sleep(50);
        hasBeenCalled = true;
      });
      await person.emit('event');
      assert.isTrue(hasBeenCalled);
    });

    it('should work with several async listeners', async function() {
      class Person extends EventEmitterMixin() {}
      let person = new Person();
      let hasBeenCalledCounter = 0;
      person.on('event', async function() {
        await sleep(33);
        hasBeenCalledCounter++;
      });
      person.on('event', async function() {
        await sleep(66);
        hasBeenCalledCounter++;
      });
      await person.emit('event');
      assert.equal(hasBeenCalledCounter, 2);
    });
  });

  describe('#off()', function() {
    it('should remove a listener', function() {
      class Person extends EventEmitterMixin() {}
      let person = new Person();
      let hasBeenCalled = false;
      let listener = person.on('event', function() {
        hasBeenCalled = true;
      });
      person.emit('event');
      assert.isTrue(hasBeenCalled);
      person.off('event', listener);
      hasBeenCalled = false;
      person.emit('event');
      assert.isFalse(hasBeenCalled);
    });
    it('should remove all listeners in no specific handler specified', function() {
      class Person extends EventEmitterMixin() {}
      let person = new Person();
      let hasBeenCalled1 = false;
      let hasBeenCalled2 = false;
      person.on('event', function() {
        hasBeenCalled1 = true;
      });
      person.on('event', function() {
        hasBeenCalled2 = true;
      });
      person.emit('event');
      assert.isTrue(hasBeenCalled1);
      assert.isTrue(hasBeenCalled2);
      person.off('event');
      hasBeenCalled1 = false;
      hasBeenCalled2 = false;
      person.emit('event');
      assert.isFalse(hasBeenCalled1);
      assert.isFalse(hasBeenCalled2);
    });
  });
});
