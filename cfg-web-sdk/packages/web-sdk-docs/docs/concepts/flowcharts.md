---
id: flowcharts
title: Flowcharts
sidebar_label: Flowcharts
---

import FlowchartLegend from "./flowchart/FlowchartLegend.tsx"
import FlowchartAuth from "./flowchart/FlowchartAuth.tsx"
import FlowchartTOC from "./flowchart/FlowchartTOC.tsx"
import FlowchartProduct from "./flowchart/FlowchartProduct.tsx"
import FlowchartValidate from "./flowchart/FlowchartValidate.tsx"
import {
API,
Babylon,
Option,
Product,
CatalogueWebAPI,
WebConfigurator,
ProductConfiguration,
SDK,
AccessToken,
Catalogue,
ApplicationAreas,
SessionToken
} from "../vocabulary/vocabulary.tsx";

The purpose of this chapter is to give an overview of the data structures and <API/> calls available in the <SDK/>.

### Introduction

These flowcharts are examples of how implementation can be done and focus on how data structures and <API/> calls work together. Below the different symbols used in the flowcharts are presented.
<FlowchartLegend />

### Authentication

The first step to being able to use the <SDK/> is to authenticate your <AccessToken/>. This is done from your server side with the help of a _postAuthorize_ request. The Authorize request returns a <SessionToken/> as part of its _AuthorizeResponse_. This token needs to be generated once per session, meaning the authorization step only needs to be done once. The AuthorizeResponse given from this <API/> call is the gate to the rest of the <SDK/>. It contains information needed for the remaining <API/> calls and therefore needs to be forwarded to the rest of the application. The AuthorizeResponse is also used in a <CatalogueWebAPI/> object, used to make <API /> calls.

Make sure to store your <AccessToken/> in a secure way so that it never ends up on client side.
<FlowchartAuth />

### Table of content

A table of content can be made from every _CataloguePermission_. The CataloguePermissions available are found in the _AuthorizeResponse_ gotten from the authentication step. The table of content for a specific CataloguePermission can be created by making a _getTocTree_ request which returns a _TOCResponse_. The response contains an array of _Levels_. Each Level contains an array of _ProductRefs_. Each ProductRef can be used to display an item in the Table of Content. To be able to make the getTocTree request you need to create a _GetTocTreeParams_ object containing information about the <Catalogue/> to display and which language to use. The request is made through the <CatalogueWebAPI/> object provided with the AuthorizeResponse, created in the authentication step.
<FlowchartTOC />

### Get product

To show a product page a _ProductRef_ has to be used. The ProductRef refers to a specific <Product /> in a <Catalogue/>. All <Product s="s"/> corresponding a <Catalogue /> are found in the _TOCResponse_ from the _getTOCTree_ request made in the table of content step.

A _GetProductParams_ object containing information about the specific product from the ProductRef and some information about the <Catalogue/>, is used to make a _getProduct_ request. From the _ProductResponse_ a _CfgProductSelection_ object can be created. This object along with the <ApplicationAreas/> of the <Catalogue/> can be used to create a <Babylon t="BabylonView"/> object.
<FlowchartProduct />

### Validate product

Validation of the <Product/> needs to be made after a new <ProductConfiguration/> has been chosen. To choose <Product/> <Option s="s"/> a premade <WebConfigurator/> can be used. The <WebConfigurator t="Configurator"/> makes changes to the given _CfgProductSelection_ object. To reflect the chosen <Option s="s"/>, listen for changes in the CfgProductSelection and make a _postValidate_ request. The _ValidateResponse_ gotten can then be used to update the CfgProductSelection object and the _BabylonView_ with validated data. Both BabylonView and <WebConfigurator t="Configurator"/> which use CfgProductSelection as input will be updated as a result of this.
<FlowchartValidate />
