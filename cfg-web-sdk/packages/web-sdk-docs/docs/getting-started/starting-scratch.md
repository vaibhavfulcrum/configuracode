---
id: starting-scratch
title: Starting from scratch
sidebar_label: Starting from scratch
---

For this guide we'll be using the React framework [Next.js](https://nextjs.org/) which comes with a great set of features out of the box.

Easiest way to get started is using the <em>create-next-app</em>, which sets up everything automatically for you.

```sh
npx create-next-app
# or
yarn create next-app
```

Follow the questions in the guide. For this guide will call our project <em>web-configurator</em> and use the default starter app as our template. When the setup is done go into your newly created folder.

```sh
cd web-configurator # or whatever project name you choose
```

This is completely optional but to make code formatting easy we'll use [Prettier](https://prettier.io/).

```sh
yarn add prettier --dev --exact
```

Once that is installed we can create a prettier config file called `.prettierrc.json` in the root of the folder with either our perfered settings or tweak to your liking.

```json
{
	"printWidth": 100,
	"tabWidth": 4,
	"trailingComma": "es5",
	"useTabs": true,
	"overrides": [
		{
			"files": "*.yml",
			"options": {
				"useTabs": false,
				"tabWidth": 2
			}
		}
	]
}
```

Since our packages are written using TypeScript we'll have Next.js setup with TypeScript as well. Doing so is quite easily. We just need to create an empty tsconfig.json and start the dev server.

```sh
touch tsconfig.json
yarn add --dev typescript @types/react @types/node
yarn dev # start dev server
```

If everything has worked as planned you should now have a base app up and running. The next thing we'll do is create a server route.

First create an empty server file in the api routes

```sh
touch pages/api/auth.ts
```

Then we need to install our web-api-auth package which provides API functions.

```sh
yarn add @configura/web-api-auth
```

Lets then create an environment file for storing our ???.

```sh
touch .env.local
```

Inside of `.env.local` add `CATALOGUE_API_ACCESSTOKEN=YOUR_ACCESSTOKEN` and save the file. Now we can go ahead an write a simple server inside of `auth.ts` that we created earlier. This fill will handle the authenticate call to Configuras Cloud Services which will return permissions and a ??? token.

```ts
import { NextApiRequest, NextApiResponse } from "next";
import { CatalogueAuthAPI } from "@configura/web-api-auth";

const accessToken = process.env.CATALOGUE_API_ACCESSTOKEN || "";
if (accessToken === "") {
	console.error("ERROR! CATALOGUE_API_ACCESSTOKEN environment variable not set");
	process.exit(1);
}

let endpoint = process.env.CATALOGUE_API_ENDPOINT || "";
if (endpoint === "") {
	endpoint = "https://catalogueapi.configura.com";
}

console.log({ endpoint, accessToken });

const api = new CatalogueAuthAPI();
api.auth = { endpoint, accessToken };

export default (req: NextApiRequest, res: NextApiResponse) => {
	api.postAuthorize({})
		.then((auth) => {
			console.log(auth);
			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json; charset=utf-8");
			res.end(JSON.stringify(auth));
		})
		.catch((e) => {
			console.log(e);
			res.statusCode = 500;
			res.setHeader("Content-Type", "application/json; charset=utf-8");
			res.end(JSON.stringify({ error: "internal server error" }));
		});
};
```

To quickly try out the new API call you can visit http://localhost:3000/api/auth and you should be able to see the response.

Alright, the server is in place! Now we'll create a page where we list our different permissions that we recieved from the server. To do that we'll need to add our `web-api` packages and a package called `swr` which handles request.

```sh
yarn add @configura/web-api
yarn add swr
```

We'll list our permissions directly on the start page so we'll rename `index.js` to `index.tsx` because we want TypeScript support. Then we'll remove all of the content and replace it with this:

```tsx
import Head from "next/head";
import Link from "next/link";
import useSWR from "swr";
import { AuthorizeResponse } from "@configura/web-api";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Home() {
	const { data, error } = useSWR<AuthorizeResponse>("/api/auth", fetcher);
	if (error) return <div>failed to load</div>;
	if (!data) return <div>loading...</div>;

	const permissions: React.ReactNode[] = [];
	for (const p of data.apiSession.permissions) {
		for (const vendor of p.vendors || []) {
			for (const priceList of p.priceLists || []) {
				permissions.push(
					<li>
						<Link
							href={`/${p.enterprise}/${p.prdCat}/${p.prdCatVersion}/${
								vendor || "-"
							}/${priceList || "-"}`}
						>
							{`${p.enterprise} / ${p.prdCat} / ${p.prdCatVersion} / ${vendor} / ${priceList}`}
						</Link>
					</li>
				);
			}
		}
	}

	return (
		<div className="container">
			<Head>
				<title>Create Next App</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main>
				<ul>{permissions}</ul>
			</main>
		</div>
	);
}
```

## This section is not done yet

Next lets install our packages.

```

yarn add @configura/web-api @configura/web-ui @configura/babylon-view-react

```

Now let's go ahead and create a simple start page.

```

```
