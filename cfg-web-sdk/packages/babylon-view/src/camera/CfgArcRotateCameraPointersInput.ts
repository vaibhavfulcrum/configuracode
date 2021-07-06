/// This class exists to workaround a severe touch input issue that exists on at least iOS 13.4 in
/// Babylon release 4.1.0 and possibly later.
///
/// The main workaround is marked with "--- START OF WORKAROUND ---" in the source below.
///
/// Most of the code below is copied from the Babylon source class BaseCameraPointersInput.ts,
/// which ArcRotateCameraPointersInput extends. Some additional private support code from
/// BaseCameraPointersInput is also included and suffixed with "CfgPatch".
///
/// WARNING: DO NOT do any other changes to this file! They WILL be lost when this workaround is no
/// longer needed.
///
/// TODO: Every time the babylon module is updated to a new release, test if the workaround is still
/// needed. If not, simply remove this file and update CfgOrbitalCamera.ts to not use it.

import { ArcRotateCameraPointersInput } from "@babylonjs/core/Cameras/Inputs/arcRotateCameraPointersInput";
import "@babylonjs/core/Engines/Extensions/engine.webVR"; // isInVRExclusivePointerMode
import { PointerEventTypes, PointerInfo, PointerTouch } from "@babylonjs/core/Events/pointerEvents";
import { EventState, Observer } from "@babylonjs/core/Misc/observable";
import { Tools } from "@babylonjs/core/Misc/tools";
import { Nullable } from "@babylonjs/core/types";

export class CfgArcRotateCameraPointersInput extends ArcRotateCameraPointersInput {
	public attachControl(element: HTMLElement, noPreventDefault?: boolean): void {
		let engine = this.camera.getEngine();
		let previousPinchSquaredDistance = 0;
		let previousMultiTouchPanPosition: Nullable<PointerTouch> = null;

		this._pointA = null;
		this._pointB = null;

		this._altKey = false;
		this._ctrlKey = false;
		this._metaKey = false;
		this._shiftKey = false;
		this._buttonsPressed = 0;

		const pointerInput = (p: PointerInfo, s: EventState) => {
			let evt = p.event as PointerEvent;
			let isTouch = evt.pointerType === "touch";

			if (engine.isInVRExclusivePointerMode) {
				return;
			}

			if (
				p.type !== PointerEventTypes.POINTERMOVE &&
				this.buttons.indexOf(evt.button) === -1
			) {
				return;
			}

			let srcElement = (evt.srcElement || evt.target) as HTMLElement;

			this._altKey = evt.altKey;
			this._ctrlKey = evt.ctrlKey;
			this._metaKey = evt.metaKey;
			this._shiftKey = evt.shiftKey;
			this._buttonsPressed = evt.buttons;

			if (engine.isPointerLock) {
				let offsetX =
					evt.movementX ||
					evt.mozMovementX ||
					evt.webkitMovementX ||
					evt.msMovementX ||
					0;
				let offsetY =
					evt.movementY ||
					evt.mozMovementY ||
					evt.webkitMovementY ||
					evt.msMovementY ||
					0;

				this.onTouch(null, offsetX, offsetY);
				this._pointA = null;
				this._pointB = null;
			} else if (p.type === PointerEventTypes.POINTERDOWN && srcElement) {
				try {
					srcElement.setPointerCapture(evt.pointerId);
				} catch (e) {
					//Nothing to do with the error. Execution will continue.
				}

				if (this._pointA === null) {
					this._pointA = {
						x: evt.clientX,
						y: evt.clientY,
						pointerId: evt.pointerId,
						type: evt.pointerType,
					};
				} else if (this._pointB === null) {
					this._pointB = {
						x: evt.clientX,
						y: evt.clientY,
						pointerId: evt.pointerId,
						type: evt.pointerType,
					};
				}

				this.onButtonDown(evt);

				if (!noPreventDefault) {
					evt.preventDefault();
					element.focus();
				}
			} else if (p.type === PointerEventTypes.POINTERDOUBLETAP) {
				this.onDoubleTap(evt.pointerType);
			} else if (p.type === PointerEventTypes.POINTERUP && srcElement) {
				try {
					srcElement.releasePointerCapture(evt.pointerId);
				} catch (e) {
					//Nothing to do with the error.
				}

				if (!isTouch) {
					this._pointB = null; // Mouse and pen are mono pointer
				}

				//would be better to use pointers.remove(evt.pointerId) for multitouch gestures,
				//but emptying completely pointers collection is required to fix a bug on iPhone :
				//when changing orientation while pinching camera,
				//one pointer stay pressed forever if we don't release all pointers
				//will be ok to put back pointers.remove(evt.pointerId); when iPhone bug corrected
				if (engine._badOS) {
					this._pointA = this._pointB = null;
				} else {
					//only remove the impacted pointer in case of multitouch allowing on most
					//platforms switching from rotate to zoom and pan seamlessly.
					if (this._pointB && this._pointA && this._pointA.pointerId === evt.pointerId) {
						this._pointA = this._pointB;
						this._pointB = null;
					} else if (
						this._pointA &&
						this._pointB &&
						this._pointB.pointerId === evt.pointerId
					) {
						this._pointB = null;
					} else {
						this._pointA = this._pointB = null;
					}
				}

				if (previousPinchSquaredDistance !== 0 || previousMultiTouchPanPosition) {
					// Previous pinch data is populated but a button has been lifted
					// so pinch has ended.
					this.onMultiTouch(
						this._pointA,
						this._pointB,
						previousPinchSquaredDistance,
						0, // pinchSquaredDistance
						previousMultiTouchPanPosition,
						null // multiTouchPanPosition
					);
					previousPinchSquaredDistance = 0;
					previousMultiTouchPanPosition = null;
				}

				this.onButtonUp(evt);

				if (!noPreventDefault) {
					evt.preventDefault();
				}
			} else if (p.type === PointerEventTypes.POINTERMOVE) {
				if (!noPreventDefault) {
					evt.preventDefault();
				}

				// --- START OF WORKAROUND ---

				// At least iOS 13.4 has problems where some touches generates pointer move events
				// without a starting pointer down event nor a finishing pointer up. It appears
				// that the triggering cause is using two fingers at almost the same time.
				//
				// Babylon.js (version 4.1.0 as of this writing) does not gracefully handle this
				// but instead starts flickering between the two different touch points since it
				// does not validate that the pointerID matches the stored point A.
				//
				// Babylon also doesn't properly handle when more than two fingers gets pressed or
				// a third finger gets added, again starting to flicker between the touch points
				// since it only checks if the pointerID is "point A" and assumes that all other
				// touches are "point B".
				//
				// The short code snippet below provides some filtering and workarounds not yet
				// present in Babylon. All other code around this workaround comes from the release
				// version of Babylon 4.1.0, class ArcRotateCameraPointerInput.ts

				if (engine._badOS) {
					// Unknown touch when only one touch is registered, register as second touch
					if (this._pointA && !this._pointB && evt.pointerId !== this._pointA.pointerId) {
						this._pointB = {
							x: evt.clientX,
							y: evt.clientY,
							pointerId: evt.pointerId,
							type: evt.pointerType,
						};
					}
				}

				// The touch does not match either of the registered touches, ignore it
				if (
					!(
						(this._pointA && this._pointA.pointerId === evt.pointerId) ||
						(this._pointB && this._pointB.pointerId === evt.pointerId)
					)
				) {
					return;
				}

				// --- END OF WORKAROUND ---

				// One button down
				if (this._pointA && this._pointB === null) {
					var offsetX = evt.clientX - this._pointA.x;
					var offsetY = evt.clientY - this._pointA.y;
					this.onTouch(this._pointA, offsetX, offsetY);

					this._pointA.x = evt.clientX;
					this._pointA.y = evt.clientY;
				}
				// Two buttons down: pinch
				else if (this._pointA && this._pointB) {
					var ed = this._pointA.pointerId === evt.pointerId ? this._pointA : this._pointB;
					ed.x = evt.clientX;
					ed.y = evt.clientY;
					var distX = this._pointA.x - this._pointB.x;
					var distY = this._pointA.y - this._pointB.y;
					var pinchSquaredDistance = distX * distX + distY * distY;
					var multiTouchPanPosition = {
						x: (this._pointA.x + this._pointB.x) / 2,
						y: (this._pointA.y + this._pointB.y) / 2,
						pointerId: evt.pointerId,
						type: p.type,
					};

					this.onMultiTouch(
						this._pointA,
						this._pointB,
						previousPinchSquaredDistance,
						pinchSquaredDistance,
						previousMultiTouchPanPosition,
						multiTouchPanPosition
					);

					previousMultiTouchPanPosition = multiTouchPanPosition;
					previousPinchSquaredDistance = pinchSquaredDistance;
				}
			}
		};

		this._observerCfgPatch = this.camera
			.getScene()
			.onPointerObservable.add(
				pointerInput,
				PointerEventTypes.POINTERDOWN |
					PointerEventTypes.POINTERUP |
					PointerEventTypes.POINTERMOVE
			);

		this._onLostFocusCfgPatch = () => {
			this._pointA = this._pointB = null;
			previousPinchSquaredDistance = 0;
			previousMultiTouchPanPosition = null;
			this.onLostFocus();
		};

		element.addEventListener(
			"contextmenu",
			this.onContextMenu.bind(this) as EventListener,
			false
		);

		let hostWindow = this.camera.getScene().getEngine().getHostWindow();

		if (hostWindow) {
			Tools.RegisterTopRootEvents(hostWindow, [
				{ name: "blur", handler: this._onLostFocusCfgPatch },
			]);
		}
	}

	public detachControl(element: Nullable<HTMLElement>): void {
		if (this._onLostFocusCfgPatch) {
			let hostWindow = this.camera.getScene().getEngine().getHostWindow();
			if (hostWindow) {
				Tools.UnregisterTopRootEvents(hostWindow, [
					{ name: "blur", handler: this._onLostFocusCfgPatch },
				]);
			}
		}

		if (element && this._observerCfgPatch) {
			this.camera.getScene().onPointerObservable.remove(this._observerCfgPatch);
			this._observerCfgPatch = null;

			if (this.onContextMenu) {
				element.removeEventListener("contextmenu", this.onContextMenu as EventListener);
			}

			this._onLostFocusCfgPatch = null;
		}

		this._altKey = false;
		this._ctrlKey = false;
		this._metaKey = false;
		this._shiftKey = false;
		this._buttonsPressed = 0;
	}

	private _observerCfgPatch: Nullable<Observer<PointerInfo>> = null;
	private _onLostFocusCfgPatch: Nullable<(e: FocusEvent) => any> = null;
	private _pointA: Nullable<PointerTouch> = null;
	private _pointB: Nullable<PointerTouch> = null;
}
