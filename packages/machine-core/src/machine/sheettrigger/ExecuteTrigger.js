/********************************************************************************
 * Copyright (c) 2020 Cedalo AG
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 ********************************************************************************/
const AbstractTrigger = require('./AbstractTrigger');

const TYPE_CONF = { type: 'execute' };

class ExecuteTrigger extends AbstractTrigger {
	static get TYPE() {
		return TYPE_CONF.type;
	}
	constructor(cfg = {}) {
		super(Object.assign(cfg, TYPE_CONF));
		this._isActive = false;
		// flag to indicate that calculation was stopped, e.g. by return()
		this._isStopped = false;
		// flag to prevent executing twice on manual stepping if this comes before triggering sheet
		this._isExecuted = false;
		this._resumeFn = undefined;
	}

	preStep(manual) {
		super.preStep(manual);
		// init flags:
		this._isStopped = false;
		this._isExecuted = false;
	}

	execute(resumeFn) {
		this._resumeFn = resumeFn;
		this._isStopped = false;
		this._streamsheet.stats.steps += 1;
		this._isActive = true;
		this.trigger();
	}
	cancelExecute() {
		if (!this.sheet.isProcessed) this.stopProcessing();
		this._isActive = false;
	}

	step(manual) {
		if (manual && !this._isExecuted && this._isActive && this.isEndless) {
			this.doRepeatStep();
		}
	}

	// TODO: remove all passed flags!!!
	stop(onUpdate, onProcessing) {
		this._isActive = false;
		return super.stop(onUpdate, onProcessing);
	}

	doCycleStep() {
		if (this.isEndless) this._streamsheet.stats.repeatsteps += 1;
		this._doExecute();
	}
	_startRepeat() {
		// decrease since it is increased on each execute() repetition
		this._streamsheet.stats.steps -= 1;
		super._startRepeat();
	}

	doRepeatStep() {
		this._streamsheet.stats.repeatsteps += 1;
		this._doExecute();
	}
	_doExecute() {
		if (!this.isResumed && this._isActive) {
			const streamsheet = this._streamsheet;
			this._isExecuted = true;
			streamsheet.triggerStep();
			if (!this._isStopped && !this.isEndless && this._resumeFn) this._resumeFn();
			this._isActive = !this._isStopped && (this.isEndless || this.sheet.isPaused);
		}
	}

	stopProcessing(retval) {
		super.stopProcessing(retval);
		this._isStopped = true;
		if (this._resumeFn) this._resumeFn(retval);
	}

	update(config = {}) {
		if (this.isEndless && config.repeat !== 'endless') this.stopProcessing();
		super.update(config);
	}

}
module.exports = ExecuteTrigger;
