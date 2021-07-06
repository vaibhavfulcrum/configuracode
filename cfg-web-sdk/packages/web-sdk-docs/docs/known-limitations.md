---
id: known-limitations
title: Known limitations
sidebar_label: Known limitations
---

import {Explanation} from "./vocabulary/vocabulary.tsx";

## Cm3D

Cm3D is a legacy model format from Configura. The SDK only supports the more modern CmSym format. Inside of Catalogue Creator there is a tool for batch converting cm3D to CmSym.

## Color and web browsers

Support for color profiles and color matching varies between web browsers, operating systems and monitors. This means that you can never be 100% sure about what you see on your screen is the same as what other users see. For example, Firefox tends to render colors a bit differently compared to Chrome and Safari.

## Specular texture

Specular map is not yet supported.

## Transparent models with complex geometry

Models with intersecting geometry and transparency might not display as expected. This is a common issue in real time 3D-viewing and the symptoms if often that transparent parts that should be in front gets hidden by transparent parts that should be further behind. If this is a problem in one of your models, we suggest you try to break the effected transparent elements apart into smaller pieces where possible.

## On the fly UV-mapping

We currently only support "pre-baked" UV-maps. Models that try to use on the fly UV-mapping will use no UV-mapping at all, which will make Babylon.js stretch the texture to fit the corners of the geometry. In many cases, such as tables, this seems to yield passable results, so this might not be a big issue for you.

<Explanation n="Pointer Events" hSize="2" />

## React-router history workaround

React-router has a long standing bug in its History module related to handling URLs that contain special characters like '/' (encoded as "%2f") and '%'. This can lead to unexpected handling of URLs that includes parameters (catalogue, vendor, price list, product number, etc) containing such special characters or character sequences.

A fix has been made but the maintainers decided to not ship it until version 5.0.0 of the History module. More specifically they explicitly removed the fix from the 4.x branch the same day that version 4.10.0 was released.

Until the fix has been publicly released, version to 4.5.1 should be forced in the package.json file since that was the last public version without the bug. There is however a possible alternative workaround using "patch packages" if version 4.5.1 is not viable in your project, see comments on issue 505 referenced below.

#### References

-   https://github.com/ReactTraining/history/issues/745
-   https://github.com/ReactTraining/history/pull/656
-   https://github.com/ReactTraining/history/issues/505
