#! /usr/bin/env node

/**
 * Main script file
 */
const { http, config, fileHandler, helpers } = require("./utils");

console.info("This project is in no way affiliated with Cloudflare\n");
console.info(
  `By using this software you are implicitly agreeing to Cloudflare's Terms of Service: ${config.terms_url}\n`
);

const keys = helpers.argParse(...process.argv.slice(2));

const register = keys => {
  return http
    .post(config.reg_url, null, {
      install_id: "",
      tos: helpers.timestamp(),
      key: keys.public,
      fcm_token: "",
      type: "Android",
      locale: "en_US"
    })
    .then(response => http.assertResponse(response));
};

const warpspeed = account =>
  http
    .patch(
      `${config.reg_url}/${account.id}`,
      null,
      {
        warp_enabled: true
      },
      { headers: { authorization: `Bearer ${account.token}` } }
    )
    .then(response => http.assertResponse(response));

const getServerConfig = account =>
  http
    .get(`${config.reg_url}/${account.id}`, null, {
      headers: { authorization: `Bearer ${account.token}` }
    })
    .then(response => http.assertResponse(response));

const getWireGaurdConf = (ipv4, ipv6, endpoint, private, public) => `
[Interface]
PrivateKey = ${private}
DNS = 1.1.1.1
Address = ${ipv4}/32
Address = ${ipv6}/128
[Peer]
PublicKey = ${public}
AllowedIPs = 0.0.0.0/0
AllowedIPs = ::/0
Endpoint = ${endpoint}
`;

console.log(`Attempting to register with CloudFlare's WARP...`);
const WARP = {
  account: {},
  server: {}
};

register(keys)
  .then(response => {
    console.log(JSON.stringify(response.body, null, 2));
    WARP.account = response.body;
    return WARP;
  })
  .then(data => getServerConfig(data.account))
  .then(response => {
    console.log(JSON.stringify(response.body, null, 2));
    WARP.server = response.body;
    return WARP;
  })
  .then(data => warpspeed(data.account))
  .then(response => {
    console.log(JSON.stringify(response.body, null, 2));
    return WARP;
  })
  .then(data =>
    getWireGaurdConf(
      data.server.config.interface.addresses.v4,
      data.server.config.interface.addresses.v6,
      data.server.config.peers[0].endpoint.host,
      keys.private,
      keys.public
    )
  )
  .then(conf => console.log(conf))
  .catch(e => {
    console.error("error caught: ", e);
    console.debug(JSON.stringify(e, null, 2));
    process.exit(1);
  })
  .finally(() => process.exit(0));
