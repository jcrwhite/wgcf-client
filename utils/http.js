/**
 * A simple Promise wrapper around the native Node.JS http(s) module.
 *
 * @description this may not be the best wrapper around, but I've had it forever and it works
 *
 */

const request = require("http").request;
const secureRequest = require("https").request;
const encode = require("querystring").encode;

const default_options = {
  form: false,
  json: true,
  timeout: 30000,
  follow_redirects: true
};

const shhHTTP = (
  method = "GET",
  url,
  params = null,
  body = null,
  options = default_options
) => {
  const parsedMethod = method.toUpperCase();
  const parsedParams = !!params ? encode(params) : null;
  let urlObject;
  try {
    urlObject = new URL(url);
  } catch (error) {
    throw new Error(`Invalid url ${url}`);
  }
  const agent = urlObject.protocol === "https:" ? secureRequest : request;
  if (body && parsedMethod === "GET") {
    throw new Error(
      `Invalid use of the body parameter while using the ${method.toUpperCase()} method.`
    );
  }
  let requestOptions = {
    method: parsedMethod,
    headers: options.headers || {},
    hostname: urlObject.hostname,
    path: urlObject.pathname,
    protocol: urlObject.protocol,
    timeout: options.timeout
  };
  if (urlObject.port) {
    requestOptions.port = +urlObject.port;
  }
  if (urlObject.search || parsedParams) {
    requestOptions.path += `?${parsedParams || urlObject.search}`;
  }
  if (options.form && options.json) {
    throw new Error("Request cannot be both type form and type json.");
  }
  if (options.form) {
    requestOptions.headers["content-type"] =
      "application/x-www-form-urlencoded";
  }
  if (options.json) {
    requestOptions.headers["content-type"] =
      "application/json; ; charset=UTF-8";
  }
  if (body) {
    if (options.json) {
      body = JSON.stringify(body);
    }
    if (options.form) {
      body = encode(body);
    }
    requestOptions.headers["content-length"] = Buffer.byteLength(body);
  }

  return new Promise((resolve, reject) => {
    const req = agent(requestOptions, res => {
      const response = {
        statusCode: res.statusCode,
        headers: res.headers,
        body: ""
      };

      res.setEncoding("utf8");
      res.on("data", chunk => {
        response.body += chunk;
      });

      res.on("end", () => {
        if (options.json) {
          try {
            response.body = JSON.parse(response.body);
          } catch (e) {
            reject(e);
          }
        }
        resolve(response);
      });
    });
    req.on("timeout", () => {
      req.abort();
      let e = new Error("Connection timed out.");
      e.code = "ECONNTIMEOUT";
      reject(e);
    });

    req.on("error", e => {
      reject(e);
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
};

const assertResponse = response =>
  new Promise((resolve, reject) => {
    if (response.statusCode >= 200 && response.statusCode <= 308) {
      resolve(response);
    } else {
      let e = new Error(
        "Invalid response HTTP statusCode: " + response.statusCode
      );
      e.code = "EBADRESCODE";
      e.body = response.body;
      reject(e);
    }
  });

const _get = (url, params = null, options) =>
  shhHTTP("get", url, params, null, { ...default_options, ...options });

const _put = (url, params = null, body = null, options) =>
  shhHTTP("put", url, params, body, { ...default_options, ...options });

const _patch = (url, params = null, body = null, options) =>
  shhHTTP("patch", url, params, body, { ...default_options, ...options });

const _post = (url, params = null, body = null, options) =>
  shhHTTP("post", url, params, body, { ...default_options, ...options });

const _delete = (url, params = null, body = null, options) =>
  shhHTTP("delete", url, params, body, { ...default_options, ...options });

module.exports = {
  get: _get,
  put: _put,
  patch: _patch,
  post: _post,
  delete: _delete,
  assertResponse,
  shhHTTP,
  default: shhHTTP
};
