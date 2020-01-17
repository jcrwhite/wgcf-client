/**
 * Some small helper functions
 */

const ARGS = ["--public", "--private"];

const timestamp = () => new Date().toISOString();

const argParse = (...args) => {
  if (
    !args ||
    args.length < 4 ||
    !args[0].startsWith("--p") ||
    !args[2].startsWith("--p")
  ) {
    console.error("No public private keypair provided!");
    console.info("Example: ./wgcf.js --public abc123 --private shhhhhh");
    process.exit(1);
  }
  args = args.map(arg => (arg || "").trim());
  let keys = {};
  keys[args[0].replace("--", "")] = args[1];
  keys[args[2].replace("--", "")] = args[3];
  return keys;
};

module.exports = {
  timestamp,
  argParse
};
