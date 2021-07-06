import {
	ScheduleRerender,
	SingleProductDefaultCameraViewConfiguration,
	SingleProductViewPhase,
	SingleProductViewPhaseEvent,
} from "@configura/babylon-view";
import { BabylonView } from "@configura/babylon-view-react";
import { RenderEnv } from "@configura/babylon-view/dist/view/RenderEnv";
import { GeneratedProductConfiguration, GetProductParams } from "@configura/web-api";
import {
	AggregatedLoadingObservable,
	degToRad,
	loadImage,
	LogLevel,
	LogObservable,
	toError,
} from "@configura/web-utilities";
import React, { useEffect, useState } from "react";
import { ExerciserAction } from "./Exerciser";
import { ExerciserReportItem } from "./ExerciserReportItem";

export type ExerciserLogMessage = { message: string; level: LogLevel; count: number };
export type ExerciserLogMessagesMap = Map<number, ExerciserLogMessage>;

/// This configures the Babylon view, for example the camera configuration and detail levels used.
///
/// To change the detail levels, just add allowedDetailLevels. For example, the line below will
/// load the lowest available detail level for each product:
/// allowedDetailLevels: [DetailLevel.low, DetailLevel.medium, DetailLevel.high, DetailLevel.base],
const viewConfiguration: SingleProductDefaultCameraViewConfiguration = {
	camera: {
		yaw: degToRad(110),
		pitch: degToRad(70),
	},
};

interface Snapshot {
	url: string;
	image?: HTMLImageElement;
}

async function snapImage(scheduleRerender: ScheduleRerender): Promise<Snapshot> {
	const url = await new Promise<string>((resolve) => scheduleRerender(resolve));
	const image = await loadImage(url);
	return { image, url };
}

interface Props {
	addErrorReportItem: (err: unknown) => void;
	addReportItem: (item: ExerciserReportItem) => void;
	loadingObservable: AggregatedLoadingObservable;
	productIterator: AsyncIterableIterator<GeneratedProductConfiguration>;
	generateExerciserUrl: (
		action: ExerciserAction,
		lang: string,
		params: Partial<GetProductParams>
	) => string;
}

export function ExerciserRunner(props: Props): JSX.Element | null {
	const {
		addErrorReportItem,
		addReportItem,
		generateExerciserUrl,
		loadingObservable,
		productIterator,
	} = props;

	const [viewPhase, setViewPhase] = useState<SingleProductViewPhaseEvent>();
	const [renderEnv, setRenderEnv] = useState<RenderEnv>();

	const [startLoading, setStartLoading] = useState(performance.now());
	const [productResult, setProductResult] = useState<
		IteratorResult<GeneratedProductConfiguration, unknown> | Error
	>();
	const [product, setProduct] = useState<GeneratedProductConfiguration>();
	const [snapshotResult, setSnapshotResult] = useState<Snapshot | Error>();

	const loadNext = () => {
		setSnapshotResult(undefined);
		setViewStateReachedIdleOrError(undefined);
		setStartLoading(performance.now());
	};

	useEffect(() => {
		let canceled = false;
		LogObservable.clear();
		const token = loadingObservable.startChildLoading();
		productIterator
			.next()
			.then((result) => !canceled && setProductResult(result))
			.catch((err) => !canceled && setProductResult(toError(err)))
			.then(() => loadingObservable.stopChildLoading(token));
		return () => {
			canceled = true;
			loadingObservable.stopChildLoading(token);
		};
	}, [startLoading, loadingObservable, productIterator]);

	useEffect(() => {
		let token: unknown;
		if (productResult === undefined) {
			// done or not started
			return;
		} else if (productResult instanceof Error) {
			addErrorReportItem(productResult);
			loadNext();
		} else if (productResult.done) {
			setProduct(undefined);
		} else {
			token = loadingObservable.startChildLoading();
			setProduct(productResult.value);
		}
		return () => loadingObservable.stopChildLoading(token);
	}, [addErrorReportItem, loadingObservable, productResult]);

	const [viewStateReachedIdleOrError, setViewStateReachedIdleOrError] = useState<object>();

	useEffect(() => {
		if (
			viewPhase === undefined ||
			(viewPhase.current !== SingleProductViewPhase.Idle &&
				viewPhase.current !== SingleProductViewPhase.Error)
		) {
			return;
		}

		setViewStateReachedIdleOrError({});
	}, [viewPhase]);

	useEffect(() => {
		if (
			product === undefined ||
			renderEnv === undefined ||
			viewStateReachedIdleOrError === undefined
		) {
			return;
		}

		let canceled = false;
		const token = loadingObservable.startChildLoading();
		snapImage(renderEnv.scheduleRerender)
			.then((url) => !canceled && setSnapshotResult(url))
			.catch((err) => !canceled && setSnapshotResult(toError(err)))
			.then(() => loadingObservable.stopChildLoading(token));
		return () => {
			canceled = true;
			loadingObservable.stopChildLoading(token);
		};
	}, [product, viewStateReachedIdleOrError, renderEnv, loadingObservable]);

	useEffect(() => {
		if (product === undefined || snapshotResult === undefined) {
			// done or loading
			return;
		} else if (snapshotResult instanceof Error) {
			addErrorReportItem(snapshotResult);
		} else {
			addReportItem({
				duration: performance.now() - startLoading,
				imageDataUrl: snapshotResult.image && snapshotResult.url,
				logMessages: LogObservable.allMessages,
				product: product,
				productUrl: generateExerciserUrl(
					"run",
					product.productParams.lang,
					product.productParams
				),
				randId: Math.random(),
			});
		}
		loadNext();
	}, [
		addErrorReportItem,
		addReportItem,
		generateExerciserUrl,
		product,
		snapshotResult,
		startLoading,
	]);

	if (!product) {
		return null;
	}

	return (
		<BabylonView
			errorCallback={setProductResult} // if we encounter an error for a product, we set the result to Error which will add it to the report and go to the next product
			applicationAreas={product.applicationAreasResponse.applicationAreas}
			productData={product.productResponse.productData}
			productConfiguration={product.productConfiguration}
			width={500}
			height={500}
			viewPhaseCallback={setViewPhase}
			renderEnvironmentCallback={setRenderEnv}
			configuration={viewConfiguration}
		/>
	);
}
