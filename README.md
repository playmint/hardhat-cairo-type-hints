# hardhat-cairo-type-hints
A plugin for hardhat which compiles your Cairo type hints for you.

## How it Works
Extends [Hardhat StarkNet compile](https://www.npmjs.com/package/@playmint/hardhat-starknet-compile) to use [Cairo type hints](https://pypi.org/project/cairo-type-hints/) during compilation

## Installation

Make sure to install [Cairo type hints](https://pypi.org/project/cairo-type-hints/) to your Python environment.

Install with npm:

`npm i --save-dev @playmint/hardhat-cairo-type-hints`

Then import in your hardhat.config file after Hardhat StarkNet compile:

```ts
import "@playmint/hardhat-starknet-compile";
import "@playmint/hardhat-cairo-type-hints";
```

## How to use
Type hint artifacts are generated whenever a compile task runs, either:
- run the `compile` task (`npx hardhat compile`), or
- run the `starknet-compile` task (`npx hardhat starknet-compile`)

The artifacts created can be used with [Stark-dot-net](https://github.com/playmint/stark-dot-net) and other compatible code generators
