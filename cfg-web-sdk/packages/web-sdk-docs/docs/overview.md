---
id: overview
title: Overview
sidebar_label: Overview
---

import { CatalogueWebAPI, SDK, CETDesigner, AccessToken, TokenSecret, SessionToken, TermLinkView, WebConfigurator } from "./vocabulary/vocabulary.tsx";

## Background

Configura has created a global platform through <CETDesigner />, an all-in-one software solution for space planning and product configuration, made for professional designers. Our partners make an investment adding their product data to our platform. One of the ways they do this is through our data driven solution: <TermLinkView n="Catalogues" />.

We wanted to create a new solution that enables partners to further leverage their investment into Catalogues. That’s why we created our <WebConfigurator /> solution. It allows our partners to reuse their Catalogue data in new and innovative ways on a variety of platforms.

## Introduction

Our web configurator solution is made up of two main building blocks: The <CatalogueWebAPI t="Catalogue Web Application Programming Interface (API)" /> and the <SDK t="Software Development Kit (SDK)" />.

With our well-defined API you can easily fetch your Catalogue data to use in applications or websites outside of CET Designer. Our API is secured over Transport Layer Security for end-to-end encryption. Data is retrieved with <SessionToken s="s" /> which are generated for each client. This gives you power to fully control who can access the data for maximum security.

## Accessing the API

Accessing the API begins with the <AccessToken /> you have been issued. This Token contains a <TokenSecret t="Secret" /> and should never ever be exposed to end users. For clients you will use the Catalogue Web Auth API to issue <SessionToken s="s" /> which are used to access the actual Catalogue Web API.

Essentially this means you must “proxy” the SessionToken issuing on your server. This makes it possible for you to for example only issue SessionTokens to logged in users.
