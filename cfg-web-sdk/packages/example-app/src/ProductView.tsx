import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import {
	BABYLON_TO_CET_MATRIX,
	OrbitalCameraConfigurationProps,
	SingleProductDefaultCameraViewConfiguration,
} from "@configura/babylon-view";
import { BabylonView } from "@configura/babylon-view-react";
import {
	CatalogueParams,
	CfgProductConfiguration,
	ExportStatus,
	getPrdCatVersionOrLatestFromPermissions,
	ProductConfigurationChangeNotification,
	ProductData,
	RenderStatus,
	SelectedOption,
	TargetCameraArgs,
} from "@configura/web-api";
import {
	CanvasWrapper,
	Configurator,
	ConfiguratorWrapper,
	OverlayLoading,
	useResize,
} from "@configura/web-ui";
import { degToRad } from "@configura/web-utilities";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { APIContext, ErrorContext } from "./App";
import { ApplicationAreasContext } from "./CatalogueRoutes";
import styles from "./index.module.css";
import { InspectorContext } from "./InspectorContext";
import { PageHeader } from "./PageHeader";

// RENDER_SIZE is used as a limit on the size we request from the render call.
// Note that the server might impose additional restrictions and return a smaller image.
const RENDER_SIZE = 3000;

interface Props extends CatalogueParams {
	partNumber: string;
	parentURL: string;
}

export default function ProductView(props: Props) {
	const viewConfiguration = useMemo<SingleProductDefaultCameraViewConfiguration>(() => {
		const conf: SingleProductDefaultCameraViewConfiguration = {
			camera: {
				yaw: degToRad(110),
				pitch: degToRad(70),
			},
			// Example on how to load the lowest quality available
			// allowedDetailLevels: [
			// 	DetailLevel.low,
			// 	DetailLevel.medium,
			// 	DetailLevel.high,
			// 	DetailLevel.base,
			// ],
			// experimentalAnimationCoordinator: CoordinatorDropAndSpin.getCoordinatorCreator(),
			// experimentalAnimationCoordinator: CoordinatorPulseHighlight.getCoordinatorCreator(),
			// experimentalAnimationCoordinator: CoordinatorPulseInflate.getCoordinatorCreator(),
			// experimentalAnimationCoordinator: CoordinatorPulseBounce.getCoordinatorCreator(),
		};
		return conf;
	}, []);

	const api = useContext(APIContext);

	const { enterprise, prdCat, vendor, priceList, partNumber } = props;

	const cataloguePermissions = api.auth?.apiSession.permissions;
	const prdCatVersion = getPrdCatVersionOrLatestFromPermissions(
		props,
		cataloguePermissions || []
	);

	const setError = useContext(ErrorContext);

	const productConfigurationRef = useRef<CfgProductConfiguration>();

	const [productData, setProductData] = useState<ProductData | undefined>();
	const [unvalidatedSelectedOptions, setUnvalidatedSelectedOptions] = useState<
		SelectedOption[]
	>();

	const [loading, setLoading] = useState(false);
	const [loadingModels, setLoadingModels] = useState(false);

	const orbitalCameraConfigurationRef = useRef<OrbitalCameraConfigurationProps>();

	const [exportStatus, setExportStatus] = useState<ExportStatus>();
	const [exportProduct, setExportProduct] = useState<SelectedOption[]>();

	const [renderStatus, setRenderStatus] = useState<RenderStatus>();
	const [renderProduct, setRenderProduct] = useState<SelectedOption[]>();

	const wrapperRef = useRef<HTMLDivElement>(null);
	const wrapperElement = wrapperRef.current !== null ? wrapperRef.current : undefined;

	const [size] = useResize(wrapperElement);
	const { height, width } = size;

	const applicationAreas = useContext(ApplicationAreasContext);
	const inspectorContext = useContext(InspectorContext);

	const lang = "en-US";

	const productConfiguration = productConfigurationRef.current;
	useEffect(() => {
		if (!productConfiguration) {
			return;
		}
		// when the selection changes we save the serialized version to selOptions to trigger
		// a validation call (and a rerender) if needed, otherwise we just trigger a rerender
		const listener = (notification: ProductConfigurationChangeNotification) => {
			if (!notification.validated) {
				setUnvalidatedSelectedOptions(productConfiguration.getApiSelection());
			}
		};

		productConfiguration.listenForChange(listener);
		return () => {
			productConfiguration.stopListenForChange(listener);
		};
	}, [productConfiguration]);

	useEffect(() => {
		let canceled = false;

		setLoading(true);

		api.getProduct({
			lang,
			enterprise,
			prdCat,
			prdCatVersion,
			vendor,
			priceList,
			partNumber,
		})
			.then((product) => {
				if (canceled) {
					return;
				}

				const { productData, rootFeatureRefs, features } = product;

				productConfigurationRef.current = new CfgProductConfiguration(
					rootFeatureRefs,
					features,
					productData.partsData.selOptions || []
				);

				setProductData(productData);
			})
			.catch((err) => {
				if (canceled) {
					return;
				}

				setError(err);
			})
			.finally(() => {
				if (canceled) {
					return;
				}
				setLoading(false);
			});

		return () => {
			canceled = true;
		};
	}, [api, enterprise, partNumber, prdCat, prdCatVersion, vendor, priceList, setError]);

	useEffect(() => {
		let canceled = false;

		if (unvalidatedSelectedOptions === undefined) {
			return;
		}

		setLoading(true);

		api.postValidate(
			{
				lang,
				enterprise,
				prdCat,
				prdCatVersion,
				vendor,
				priceList,
				partNumber,
			},
			{ selOptions: unvalidatedSelectedOptions }
		)
			.then((response) => {
				if (canceled) {
					return;
				}

				const { productData } = response;
				setRenderStatus(undefined);
				setExportStatus(undefined);
				setProductData(productData);

				const productConfiguration = productConfigurationRef.current;
				if (productConfiguration !== undefined) {
					productConfiguration.setApiSelection(
						productData.partsData.selOptions || [],
						true
					);
				}
			})
			.catch((err) => {
				if (canceled) {
					return;
				}

				setError(err);
			})
			.finally(() => {
				if (canceled) {
					return;
				}
				setUnvalidatedSelectedOptions(undefined);
				setLoading(false);
			});

		return () => {
			canceled = true;
		};
	}, [
		api,
		enterprise,
		unvalidatedSelectedOptions,
		partNumber,
		prdCat,
		prdCatVersion,
		setError,
		vendor,
		priceList,
	]);

	useEffect(() => {
		let canceled = false;

		if (
			exportStatus === undefined ||
			exportStatus.status === "failed" ||
			exportStatus.status === "finished"
		) {
			return;
		}

		setTimeout(() => {
			if (canceled) {
				return;
			}
			api.getExportById({ uuid: exportStatus.uuid })
				.then((response) => {
					if (canceled) {
						return;
					}
					setExportStatus(response.exportStatus);
				})
				.catch((err) => {
					if (canceled) {
						return;
					}
					setError(err);
				});
		}, 1 * 1000);

		return () => {
			canceled = true;
		};
	}, [api, exportStatus, setError]);

	useEffect(() => {
		let canceled = false;

		if (exportProduct === undefined) {
			return;
		}

		setLoading(true);

		api.postExport(
			{
				lang,
				enterprise,
				prdCat,
				prdCatVersion,
				vendor,
				priceList,
				partNumber,
			},
			{
				format: "fbx",
				selOptions: exportProduct,
			}
		)
			.then((response) => {
				if (canceled) {
					return;
				}

				setExportStatus(response.exportStatus);
			})
			.catch((err) => {
				if (canceled) {
					return;
				}

				setError(err);
			})
			.finally(() => {
				if (canceled) {
					return;
				}
				setLoading(false);
				setExportProduct(undefined);
			});

		return () => {
			canceled = true;
		};
	}, [
		api,
		enterprise,
		exportProduct,
		partNumber,
		prdCat,
		prdCatVersion,
		setError,
		vendor,
		priceList,
	]);

	useEffect(() => {
		let canceled = false;

		if (
			renderStatus === undefined ||
			renderStatus.status === "failed" ||
			renderStatus.status === "finished"
		) {
			return;
		}

		setTimeout(() => {
			if (canceled) {
				return;
			}
			api.getRenderById({ uuid: renderStatus.uuid })
				.then((response) => {
					if (canceled) {
						return;
					}
					setRenderStatus(response.renderStatus);
				})
				.catch((err) => {
					if (canceled) {
						return;
					}
					setError(err);
				});
		}, 1 * 1000);

		return () => {
			canceled = true;
		};
	}, [api, renderStatus, setError]);

	useEffect(() => {
		let canceled = false;

		if (renderProduct === undefined) {
			return;
		}

		setLoading(true);

		let width = RENDER_SIZE;
		let height = RENDER_SIZE;

		const orbitalCameraConfiguration = orbitalCameraConfigurationRef.current;
		let targetCameraArgs: TargetCameraArgs | undefined;
		if (orbitalCameraConfiguration !== undefined) {
			const {
				nearClipping,
				position,
				contentPosition,
				fov,
				aspect,
			} = orbitalCameraConfiguration;

			targetCameraArgs = {
				location: Vector3.TransformCoordinates(position, BABYLON_TO_CET_MATRIX),
				target: Vector3.TransformCoordinates(contentPosition, BABYLON_TO_CET_MATRIX),
				nearClip: nearClipping,
				fov: fov,
			};
			if (aspect < 1) {
				width = RENDER_SIZE * aspect;
			} else {
				height = RENDER_SIZE / aspect;
			}
		}

		api.postRender(
			{
				lang,
				enterprise,
				prdCat,
				prdCatVersion,
				vendor,
				priceList,
				partNumber,
			},
			{
				selOptions: renderProduct,
				format: "png",
				width: Math.floor(width),
				height: Math.floor(height),
				targetCameraArgs,
			}
		)
			.then((response) => {
				if (canceled) {
					return;
				}

				setRenderStatus(response.renderStatus);
			})
			.catch((err) => {
				if (canceled) {
					return;
				}

				setError(err);
			})
			.finally(() => {
				if (canceled) {
					return;
				}
				setRenderProduct(undefined);
				setLoading(false);
			});

		return () => {
			canceled = true;
		};
	}, [
		api,
		enterprise,
		renderProduct,
		partNumber,
		prdCat,
		prdCatVersion,
		setError,
		vendor,
		priceList,
		productConfiguration,
	]);

	function handleExport(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();
		if (productConfiguration === undefined) {
			return;
		}
		setExportProduct(productConfiguration.getApiSelection());
	}

	function handleRender(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();
		if (productConfiguration === undefined) {
			return;
		}
		setRenderProduct(productConfiguration.getApiSelection());
	}

	return (
		<main>
			<PageHeader parentURL={props.parentURL}>Configurator</PageHeader>
			{productData === undefined && (
				<OverlayLoading fullWindow={true} className={styles.fontSize10} />
			)}
			<ConfiguratorWrapper>
				<CanvasWrapper
					ref={wrapperRef}
					loading={loading || loadingModels}
					className={styles.fontSize10}
				>
					{productData !== undefined && productConfiguration !== undefined && (
						<BabylonView
							applicationAreas={applicationAreas}
							orbitalCameraConfigurationCallback={(c) => {
								orbitalCameraConfigurationRef.current = c;
							}}
							configuration={viewConfiguration}
							errorCallback={setError}
							height={height}
							loadingCallback={setLoadingModels}
							productData={productData}
							productConfiguration={productConfiguration}
							width={width}
							showInspector={inspectorContext?.showInspector}
						/>
					)}
				</CanvasWrapper>
				{productData !== undefined && productConfiguration !== undefined && (
					<Configurator
						exportStatus={exportStatus}
						handleExport={api.hasFeature("export") ? handleExport : undefined}
						handleRender={api.hasFeature("render") ? handleRender : undefined}
						productData={productData}
						productConfiguration={productConfiguration}
						renderStatus={renderStatus}
					/>
				)}
			</ConfiguratorWrapper>
		</main>
	);
}
