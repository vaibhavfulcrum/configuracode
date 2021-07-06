export type EasingFunction = (t: number) => number;

export const EasingFunctions = {
	// no easing, no acceleration
	linear: ((t) => t) as EasingFunction,
	// accelerating from zero velocity
	easeInQuad: ((t) => t * t) as EasingFunction,
	// decelerating to zero velocity
	easeOutQuad: ((t) => t * (2 - t)) as EasingFunction,
	// acceleration until halfway, then deceleration
	easeInOutQuad: ((t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)) as EasingFunction,
	// accelerating from zero velocity
	easeInCubic: ((t) => t * t * t) as EasingFunction,
	// decelerating to zero velocity
	easeOutCubic: ((t) => --t * t * t + 1) as EasingFunction,
	// acceleration until halfway, then deceleration
	easeInOutCubic: ((t) =>
		t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1) as EasingFunction,
	// accelerating from zero velocity
	easeInQuart: ((t) => t * t * t * t) as EasingFunction,
	// decelerating to zero velocity
	easeOutQuart: ((t) => 1 - --t * t * t * t) as EasingFunction,
	// acceleration until halfway, then deceleration
	easeInOutQuart: ((t) =>
		t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t) as EasingFunction,
	// accelerating from zero velocity
	easeInQuint: ((t) => t * t * t * t * t) as EasingFunction,
	// decelerating to zero velocity
	easeOutQuint: ((t) => 1 + --t * t * t * t * t) as EasingFunction,
	// acceleration until halfway, then deceleration
	easeInOutQuint: ((t) =>
		t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t) as EasingFunction,
	sinBounce: (oscillations: number) => (t: number) =>
		(1 - Math.cos(t * oscillations * Math.PI * 2)) / 2,
	easeInSine: (t: number) => -Math.cos(t * (Math.PI / 2)) + 1,
	easeOutSine: (t: number) => Math.sin(t * (Math.PI / 2)),
	easeInOutSine: (t: number) => (-1 / 2) * (Math.cos(Math.PI * t) - 1),
	easeInExpo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
	easeOutExpo: (t: number) => (t === 1 ? 1 : -Math.pow(2, -10 * t) + 1),
	easeInOutExpo: (t: number) => {
		if (t === 0) return 0;
		if (t === 1) return 1;
		if ((t /= 1 / 2) < 1) return (1 / 2) * Math.pow(2, 10 * (t - 1));
		return (1 / 2) * (-Math.pow(2, -10 * --t) + 2);
	},
	easeInCirc: (t: number) => -(Math.sqrt(1 - t * t) - 1),
	easeOutCirc: (t: number) => Math.sqrt(1 - (t = t - 1) * t),
	easeInOutCirc: (t: number) => {
		if (t / 1 / 2 < 1) return (-1 / 2) * (Math.sqrt(1 - t * t) - 1);
		return (1 / 2) * (Math.sqrt(1 - (t -= 2) * t) + 1);
	},
	easeInElastic: (t: number) => {
		let s = 1.70158;
		let p = 0;
		let a = 1;
		if (t === 0) return 0;
		if (t === 1) return 1;
		if (!p) p = 0.3;
		if (a < Math.abs(1)) {
			a = 1;
			s = p / 4;
		} else {
			s = (p / (2 * Math.PI)) * Math.asin(1 / a);
		}
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t - s) * (2 * Math.PI)) / p));
	},
	easeOutElastic: (t: number) => {
		let s = 1.70158;
		let p = 0;
		let a = 1;
		if (t === 0) return 0;
		if (t === 1) return 1;
		if (!p) p = 0.3;
		if (a < Math.abs(1)) {
			a = 1;
			s = p / 4;
		} else {
			s = (p / (2 * Math.PI)) * Math.asin(1 / a);
		}
		return a * Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / p) + 1;
	},
	easeInOutElastic: (t: number) => {
		let s = 1.70158;
		let p = 0;
		let a = 1;
		if (t === 0) return 0;
		if (t / 2 === 2) return 1;
		if (!p) p = 0.3 * 1.5;
		if (a < 1) {
			a = 1;
			s = p / 4;
		} else {
			s = (p / (2 * Math.PI)) * Math.asin(1 / a);
		}
		if (t < 1)
			return (
				-0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t - s) * (2 * Math.PI)) / p))
			);
		return a * Math.pow(2, -10 * (t -= 1)) * Math.sin(((t - s) * (2 * Math.PI)) / p) * 0.5 + 1;
	},
	easeInBack: (s: number = 1.70158) => (t: number) => t * t * ((s + 1) * t - s),
	easeOutBack: (s: number = 1.70158) => (t: number) => (t = t - 1) * t * ((s + 1) * t + s) + 1,
	easeInOutBack: (s: number = 1.70158) => (t: number) => {
		if ((t /= 1 / 2) < 1) return (1 / 2) * (t * t * (((s *= 1.525) + 1) * t - s));
		return (1 / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);
	},
	easeOutBounce: (t: number) => {
		if (t < 1 / 2.75) {
			return 7.5625 * t * t;
		} else if (t < 2 / 2.75) {
			return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
		} else if (t < 2.5 / 2.75) {
			return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
		} else {
			return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
		}
	},
	makeMirrored: (func: EasingFunction): EasingFunction => (t: number) => {
		const percivedT = (t < 0.5 ? t : 1 - t) * 2;
		return func(percivedT);
	},
	invert: (func: EasingFunction): EasingFunction => (t: number) => {
		return func(1 - t);
	},
};
