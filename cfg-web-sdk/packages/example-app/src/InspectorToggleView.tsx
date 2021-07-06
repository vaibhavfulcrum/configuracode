import React, { useContext } from "react";
import styles from "./index.module.css";
import { InspectorContext } from "./InspectorContext";

export const InspectorToggleView: React.FC<{}> = () => {
	const inspectorContext = useContext(InspectorContext);

	if (!inspectorContext) {
		return null;
	}

	const { active, setActive } = inspectorContext;

	return (
		<button
			className={`${styles.inspectorToggle} ${active ? styles.inspectorActive : ""}`}
			onClick={() => setActive((prevActive) => !prevActive)}
		>
			<span role="img" aria-label="Show Inspector">
				🐞
			</span>
		</button>
	);
};
