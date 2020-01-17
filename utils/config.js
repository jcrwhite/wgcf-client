/**
 * Basic static config
 */

const api_version = "v0a769";
const api = `https://api.cloudflareclient.com/${api_version}`;
const reg_url = `${api}/reg`;
const client_config_url = `${api}/client_config`;
const terms_url = "https://www.cloudflare.com/application/terms/";

module.exports = {
  api_version,
  api,
  reg_url,
  client_config_url,
  terms_url
};
