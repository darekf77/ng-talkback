//#region @notForNpm
//#region @browser
import { NgModule } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
selector: 'app-ng-talkback',
template: 'hello from ng-talkback'
})
export class NgTalkbackComponent implements OnInit {
constructor() { }

ngOnInit() { }
}

@NgModule({
imports: [],
exports: [NgTalkbackComponent],
declarations: [NgTalkbackComponent],
providers: [],
})
export class NgTalkbackModule { }
//#endregion

//#region @backend
async function start(port: number)  {

}

export default start;

//#endregion

//#endregion