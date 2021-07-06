---
id: system-interaction
title: System interaction
sidebar_label: System interaction
---

import SeqDiagramAPIUseFlow from "./seq-diagrams/SeqDiagramAPIUseFlow";

import { CatalogueWebAPI, CatalogueWebAuthAPI, Token, SessionToken, AccessToken } from "../vocabulary/vocabulary";
import { PkgExampleApp } from "../packageOverview/package-overview";

This page aims to explain the flow of how when accessing the <CatalogueWebAPI/> by explaining the different types of <Token s="s"/> and when to use which.

## Overview

The sequence diagram below displays an overview of how to access the <CatalogueWebAPI/>.

The first step is to obtain a <SessionToken/>. This should done by your backend server by using your <AccessToken/> to request a SessionToken from the <CatalogueWebAuthAPI />. The SessionToken is then sent to your client which in turn uses it in every request it makes to the Catalogue Web API.

Note that the SessionToken has a limited lifetime before it expires. When that happens, you will have to repeat the authorization steps in order to obtain a new SessionToken that your backend server can provide to the client in order for it to continue making Catalogue API requests.

The implementation details on how your client communicates with your backend server is fully up to you. But remember that the AccessToken must remain protected in your backend server and **never** be sent to, stored in, or otherwise used by your client code.

<SeqDiagramAPIUseFlow/>

:::caution Cache data
You are forbidden to cache api data on your servers. For more info [read our FAQ](/docs/faq#can-i-cache-api-data).
:::
