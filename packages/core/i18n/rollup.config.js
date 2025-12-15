import { createRollupConfig } from "../../../config/rollup";

const pkg = require('./package.json');

export default createRollupConfig({
  pkg,
  // No tailwind needed for i18n package (it's purely logic/types)
});
