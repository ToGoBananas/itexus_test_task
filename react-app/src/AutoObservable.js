import { onBecomeObserved, onBecomeUnobserved } from 'mobx'
import { observable, decorate } from "mobx";


export default class AutoObservable {
    data;

    constructor(onObserved, onUnobserved) {
        onBecomeObserved(this, 'data', onObserved);
        onBecomeUnobserved(this, 'data', onUnobserved)
    }
}

decorate(AutoObservable, {
    data: observable
});
