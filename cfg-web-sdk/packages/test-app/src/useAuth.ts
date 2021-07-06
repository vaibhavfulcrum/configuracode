import { AuthorizeResponse } from "@configura/web-api";
import { toError } from "@configura/web-utilities";
import { useEffect, useState } from "react";

// Todo: duplication

export function useAuth(setError: (error: Error) => void): AuthorizeResponse | undefined {
	const [auth, setAuth] = useState<AuthorizeResponse | undefined>(undefined);

	useEffect(() => {
		let canceled = false;

		fetch("/auth")
			.then((res) => res.json())
			.then((res: AuthorizeResponse | { error: "string" }) => {
				if (canceled) {
					return;
				}

				if ("error" in res) {
					throw Error(res.error);
				} else {
					setAuth(res);
				}
			})
			.catch((e) => {
				if (canceled) {
					return;
				}
				setError(toError(e));
			});

		return () => {
			canceled = true;
		};
	}, [setError]);

	return auth;
}
