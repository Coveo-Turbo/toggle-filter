# ToggleFilter

The `ToggleFilter` component displays a toggle switch which the end user can select to filter
the query results.

|                        ToggleFilter OFF                         |
| --------------------------------------------------------------- |
| ![image](https://share.getcloudapp.com/items/RBuqo7ED/download) |

|                         ToggleFilter ON                         |
| --------------------------------------------------------------- |
| ![image](https://share.getcloudapp.com/items/YEup5KBm/download) |


Disclaimer: This component was built by the community at large and is not an official Coveo JSUI Component. Use this component at your own risk.

## Getting Started

1. Install the component into your project.

```
npm i @coveops/toggle-filter
```

2. Use the Component or extend it

Typescript:

```javascript
import { ToggleFilter, IToggleFilterOptions } from '@coveops/toggle-filter';
```

Javascript

```javascript
const ToggleFilter = require('@coveops/toggle-filter').ToggleFilter;
```

3. You can also expose the component alongside other components being built in your project.

```javascript
export * from '@coveops/toggle-filter'
```

4. Include the component in your template as follows:

```html
<div class="CoveoToggleFilter"></div>
```

## Extending

Extending the component can be done as follows:

```javascript
import { ToggleFilter, IToggleFilterOptions } from "@coveops/toggle-filter";

export interface IExtendedToggleFilterOptions extends IToggleFilterOptions {}

export class ExtendedToggleFilter extends ToggleFilter {}
```

## Contribute

1. Clone the project
2. Copy `.env.dist` to `.env` and update the COVEO_ORG_ID and COVEO_TOKEN fields in the `.env` file to use your Coveo credentials and SERVER_PORT to configure the port of the sandbox - it will use 8080 by default.
3. Build the code base: `npm run build`
4. Serve the sandbox for live development `npm run serve`