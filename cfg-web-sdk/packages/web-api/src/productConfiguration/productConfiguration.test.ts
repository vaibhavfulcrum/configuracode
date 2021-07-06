import { CfgProductConfiguration } from "../../dist";

const testFeatureRefs =
	'[{"code":"feature-a"},{"code":"feature-b"},{"code":"feature-multiple"},{"code":"feature-optional"}]';
const testFeatures =
	'[{"code":"feature-multiple","description":"Mul Feature","multiple":true,"options":[{"code":"option-multi-a","description":"Multi Option A","featureRefs":[{"code":"feature-d"},{"code":"feature-e"}]},{"code":"option-multi-b","description":"Multi Option B","featureRefs":[{"code":"feature-g"},{"code":"feature-h"}]}]},{"code":"feature-g","description":"G Feature","options":[{"code":"option-ga","description":"Option GA"},{"code":"option-gb","description":"Option GB"}]},{"code":"feature-h","description":"H Feature","options":[{"code":"option-1h","description":"Option 1H"},{"code":"option-2h","description":"Option 2H"}]},{"code":"feature-a","description":"A Feature","options":[{"code":"option-aa","description":"Option AA","featureRefs":[{"code":"feature-c"}]},{"code":"option-ab","description":"Option AB","featureRefs":[{"code":"feature-multiple-nested"}]}]},{"code":"feature-c","description":"C Feature","options":[{"code":"option-ca","description":"Option CA"},{"code":"option-cb","description":"Option CB"}]},{"code":"feature-d","description":"D Feature","options":[{"code":"option-da","description":"Option DA"},{"code":"option-db","description":"Option DB"}]},{"code":"feature-multiple-nested","description":"Mul Nested Feature","multiple":true,"options":[{"code":"option-multi-nested-a","description":"Option Multi Nested A","featureRefs":[{"code":"feature-c"}]},{"code":"option-multi-nested-b","description":"Option Multi Nested B","featureRefs":[{"code":"feature-optional"}]}]},{"code":"feature-optional","description":"Opt Feature","optional":true,"options":[{"code":"option-optional-a","description":"Opt Option A"},{"code":"option-optional-b","description":"Opt Option B"}]},{"code":"feature-b","description":"B Feature","options":[{"code":"option-ba","description":"Option BA","featureRefs":[{"code":"feature-c"}]},{"code":"option-bb","description":"Option BB","featureRefs":[{"code":"feature-multiple-nested"}]}]},{"code":"feature-e","description":"E Feature","options":[{"code":"option-ea","description":"Option EA"},{"code":"option-eb","description":"Option EB"}]}]';

test("a productconfiguration made from a configuration should serialize to the same configuration", () => {
	const testSelOptions =
		'[{"code":"!~!","next":{"option-ab":{"code":"option-ab","next":{"option-multi-nested-a":{"code":"option-multi-nested-a","next":{"option-ca":{"code":"option-ca"}}},"option-multi-nested-b":{"code":"option-multi-nested-b","next":{"option-optional-b":{"code":"option-optional-b"}}}}}}},{"code":"!~!","next":{"option-bb":{"code":"option-bb","next":{"option-multi-nested-a":{"code":"option-multi-nested-a","next":{"option-ca":{"code":"option-ca"}}},"option-multi-nested-b":{"code":"option-multi-nested-b"}}}}},{"code":"!~!","next":{"option-multi-a":{"code":"option-multi-a","next":{"option-db":{"code":"option-db"},"option-ea":{"code":"option-ea"}}},"option-multi-b":{"code":"option-multi-b","next":{"option-ga":{"code":"option-ga"},"option-1h":{"code":"option-1h"}}}}},{"code":"!~!","next":{"option-optional-a":{"code":"option-optional-a"}}}]';

	const prodConfiguration = new CfgProductConfiguration(
		JSON.parse(testFeatureRefs),
		JSON.parse(testFeatures),
		JSON.parse(testSelOptions)
	);

	const apiSelection = prodConfiguration.getApiSelection();

	expect(apiSelection).toEqual(JSON.parse(testSelOptions));
});

test("after setting a configuration it should serialize to the same", () => {
	const testSelOptions =
		'[{"code":"!~!","next":{"option-ab":{"code":"option-ab","next":{"option-multi-nested-a":{"code":"option-multi-nested-a","next":{"option-ca":{"code":"option-ca"}}},"option-multi-nested-b":{"code":"option-multi-nested-b","next":{"option-optional-b":{"code":"option-optional-b"}}}}}}},{"code":"!~!","next":{"option-bb":{"code":"option-bb","next":{"option-multi-nested-a":{"code":"option-multi-nested-a","next":{"option-ca":{"code":"option-ca"}}},"option-multi-nested-b":{"code":"option-multi-nested-b"}}}}},{"code":"!~!","next":{"option-multi-a":{"code":"option-multi-a","next":{"option-db":{"code":"option-db"},"option-ea":{"code":"option-ea"}}},"option-multi-b":{"code":"option-multi-b","next":{"option-ga":{"code":"option-ga"},"option-1h":{"code":"option-1h"}}}}},{"code":"!~!","next":{"option-optional-a":{"code":"option-optional-a"}}}]';

	const testUpdatedSelOptions =
		'[{"code":"!~!","next":{"option-ab":{"code":"option-ab","next":{"option-multi-nested-a":{"code":"option-multi-nested-a","next":{"option-ca":{"code":"option-ca"}}},"option-multi-nested-b":{"code":"option-multi-nested-b","next":{"option-optional-a":{"code":"option-optional-a"},"option-optional-b":{"code":"option-optional-b"}}}}}}},{"code":"!~!","next":{"option-bb":{"code":"option-bb","next":{"option-multi-nested-a":{"code":"option-multi-nested-a","next":{"option-cb":{"code":"option-cb"}}},"option-multi-nested-b":{"code":"option-multi-nested-b","next":{"option-optional-b":{"code":"option-optional-b"}}}}}}},{"code":"!~!","next":{"option-multi-a":{"code":"option-multi-a","next":{"option-da":{"code":"option-da"},"option-eb":{"code":"option-eb"}}},"option-multi-b":{"code":"option-multi-b","next":{"option-ga":{"code":"option-ga"},"option-1h":{"code":"option-1h"}}}}},{"code":"!~!","next":{"option-optional-a":{"code":"option-optional-a"},"option-optional-b":{"code":"option-optional-b"}}}]';

	const prodConfiguration = new CfgProductConfiguration(
		JSON.parse(testFeatureRefs),
		JSON.parse(testFeatures),
		JSON.parse(testSelOptions)
	);

	prodConfiguration.setApiSelection(JSON.parse(testUpdatedSelOptions), true);

	const apiSelection = prodConfiguration.getApiSelection();

	expect(apiSelection).toEqual(JSON.parse(testUpdatedSelOptions));
});

test("trying configuration a multiple-option throws", () => {
	const testSelOptions =
		'[{"code":"!~!","next":{"option-aa":{"code":"option-aa","next":{"option-ca":{"code":"option-ca"}}}}},{"code":"!~!","next":{"option-bb":{"code":"option-bb","next":{"option-multi-nested-a":{"code":"option-multi-nested-a","next":{"option-ca":{"code":"option-ca"}}},"option-multi-nested-b":{"code":"option-multi-nested-b"}}}}},{"code":"!~!","next":{"option-multi-a":{"code":"option-multi-a","next":{"option-da":{"code":"option-da"},"option-ea":{"code":"option-ea"}}},"option-multi-b":{"code":"option-multi-b","next":{"option-ga":{"code":"option-ga"},"option-1h":{"code":"option-1h"}}}}},{"code":"!~!","next":{"option-optional-b":{"code":"option-optional-b"}}}]';

	const prodConfiguration = new CfgProductConfiguration(
		JSON.parse(testFeatureRefs),
		JSON.parse(testFeatures),
		JSON.parse(testSelOptions)
	);

	expect(() => {
		prodConfiguration.features[2].options[1].setSelected(true);
	}).toThrow();
});

test("after changing a configuration it should serialize correctly", () => {
	const testSelOptions =
		'[{"code":"!~!","next":{"option-aa":{"code":"option-aa","next":{"option-ca":{"code":"option-ca"}}}}},{"code":"!~!","next":{"option-bb":{"code":"option-bb","next":{"option-multi-nested-a":{"code":"option-multi-nested-a","next":{"option-ca":{"code":"option-ca"}}},"option-multi-nested-b":{"code":"option-multi-nested-b"}}}}},{"code":"!~!","next":{"option-multi-a":{"code":"option-multi-a","next":{"option-da":{"code":"option-da"},"option-ea":{"code":"option-ea"}}},"option-multi-b":{"code":"option-multi-b","next":{"option-ga":{"code":"option-ga"},"option-1h":{"code":"option-1h"}}}}},{"code":"!~!","next":{"option-optional-b":{"code":"option-optional-b"}}}]';

	const testUpdatedSelOptions =
		'[{"code":"!~!","next":{"option-aa":{"code":"option-aa","next":{"option-ca":{"code":"option-ca"}}}}},{"code":"!~!","next":{"option-ba":{"code":"option-ba"}}},{"code":"!~!","next":{"option-multi-a":{"code":"option-multi-a","next":{"option-da":{"code":"option-da"},"option-ea":{"code":"option-ea"}}},"option-multi-b":{"code":"option-multi-b","next":{"option-ga":{"code":"option-ga"},"option-1h":{"code":"option-1h"}}}}},{"code":"!~!","next":{"option-optional-b":{"code":"option-optional-b"}}}]';

	const prodConfiguration = new CfgProductConfiguration(
		JSON.parse(testFeatureRefs),
		JSON.parse(testFeatures),
		JSON.parse(testSelOptions)
	);

	prodConfiguration.features[1].options[0].setSelected(true);

	const apiSelection = prodConfiguration.getApiSelection();

	expect(apiSelection).toEqual(JSON.parse(testUpdatedSelOptions));
});
