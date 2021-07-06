import { Observable } from "./Observable";

type LoadingToken = unknown;

export class AggregatedLoadingObservable extends Observable<boolean> {
	private currentlyLoadingTokens = new Set<LoadingToken>();

	startChildLoading = (token?: LoadingToken): LoadingToken => {
		if (token === undefined) {
			token = {};
		}

		this.currentlyLoadingTokens.add(token);

		this.doNotifyAll();

		return token;
	};

	stopChildLoading = (token: LoadingToken) => {
		this.currentlyLoadingTokens.delete(token);

		this.doNotifyAll();
	};

	private doNotifyAll = () => {
		this.notifyAll(0 < this.currentlyLoadingTokens.size);
	};
}
