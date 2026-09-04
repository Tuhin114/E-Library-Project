import dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import { ApiError } from "./ApiError.js";
import { FILE_LIMITS } from "../constants/fileUploadLimits.js";

const MAX_REDIRECTS = 3;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_URL_LENGTH = 2_048;

const ALLOWED_PORTS = new Set(["", "80", "443"]);

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "ip6-loopback",
  "0.0.0.0",
  "127.0.0.1",
  "::1",
]);

/* -------------------------------------------------------------------------- */
/* IP VALIDATION                                                              */
/* -------------------------------------------------------------------------- */

const ipv4ToNumber = (address) => {
  const parts = address.split(".").map(Number);

  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return null;
  }

  return ((parts[0] * 256 + parts[1]) * 256 + parts[2]) * 256 + parts[3];
};

const isPrivateIpv4 = (address) => {
  const value = ipv4ToNumber(address);

  // Invalid IPv4 addresses are rejected.
  if (value === null) return true;

  const ranges = [
    // Unspecified / current network
    ["0.0.0.0", "0.255.255.255"],

    // Private
    ["10.0.0.0", "10.255.255.255"],
    ["172.16.0.0", "172.31.255.255"],
    ["192.168.0.0", "192.168.255.255"],

    // Carrier-grade NAT
    ["100.64.0.0", "100.127.255.255"],

    // Loopback
    ["127.0.0.0", "127.255.255.255"],

    // Link-local
    ["169.254.0.0", "169.254.255.255"],

    // IETF special-use / documentation / benchmarking
    ["192.0.0.0", "192.0.0.255"],
    ["198.18.0.0", "198.19.255.255"],
    ["198.51.100.0", "198.51.100.255"],
    ["203.0.113.0", "203.0.113.255"],

    // Multicast + reserved
    ["224.0.0.0", "255.255.255.255"],
  ].map(([start, end]) => [ipv4ToNumber(start), ipv4ToNumber(end)]);

  return ranges.some(([start, end]) => value >= start && value <= end);
};

const ipv6ToBigInt = (address) => {
  let value = address.toLowerCase();

  /*
   * Handle IPv4-embedded IPv6 addresses such as:
   *
   * ::ffff:192.168.1.10
   */
  if (value.includes(".")) {
    const lastColon = value.lastIndexOf(":");
    const embeddedIpv4 = value.slice(lastColon + 1);

    const ipv4Number = ipv4ToNumber(embeddedIpv4);

    if (ipv4Number === null) {
      return null;
    }

    const high = ((ipv4Number >>> 16) & 0xffff).toString(16);
    const low = (ipv4Number & 0xffff).toString(16);

    value = `${value.slice(0, lastColon)}${high}:${low}`;
  }

  const parts = value.split("::");

  if (parts.length > 2) {
    return null;
  }

  const left = parts[0] ? parts[0].split(":") : [];
  const right = parts[1] ? parts[1].split(":") : [];

  const missing = 8 - left.length - right.length;

  if (missing < 0) {
    return null;
  }

  if (parts.length === 1 && missing !== 0) {
    return null;
  }

  const groups = [...left, ...Array(missing).fill("0"), ...right];

  if (
    groups.length !== 8 ||
    groups.some((part) => !/^[0-9a-f]{1,4}$/.test(part))
  ) {
    return null;
  }

  return groups.reduce(
    (acc, part) => (acc << 16n) + BigInt(parseInt(part, 16)),
    0n,
  );
};

const isPrivateIpv6 = (address) => {
  const value = ipv6ToBigInt(address);

  // Invalid IPv6 = reject.
  if (value === null) return true;

  const prefix = (number, bits) => {
    const shift = 128n - BigInt(bits);

    return value >> shift === number;
  };

  /*
   * IPv4-mapped IPv6:
   *
   * ::ffff:x.x.x.x
   *
   * Apply the IPv4 restrictions to the embedded IPv4 address.
   */
  if (prefix(0xffffn, 96)) {
    const ipv4 = Number(value & 0xffffffffn);

    const ipv4Address = [
      ipv4 >>> 24,
      (ipv4 >>> 16) & 255,
      (ipv4 >>> 8) & 255,
      ipv4 & 255,
    ].join(".");

    return isPrivateIpv4(ipv4Address);
  }

  return (
    // Unspecified ::
    value === 0n ||
    // Loopback ::1
    value === 1n ||
    // IPv4-compatible / legacy loopback-like range
    prefix(0x7fn, 8) ||
    // Unique local address fc00::/7
    prefix(0xfcn, 7) ||
    // Link local fe80::/10
    prefix(0xfe80n, 10) ||
    // Site-local fec0::/10
    prefix(0xfec0n, 10) ||
    // Multicast ff00::/8
    prefix(0xffn, 8)
  );
};

const isBlockedIp = (address) => {
  if (net.isIPv4(address)) {
    return isPrivateIpv4(address);
  }

  if (net.isIPv6(address)) {
    return isPrivateIpv6(address);
  }

  // Anything that isn't a valid IP is rejected.
  return true;
};

/* -------------------------------------------------------------------------- */
/* URL VALIDATION                                                             */
/* -------------------------------------------------------------------------- */

const parseAndValidateUrl = async (rawUrl) => {
  if (
    typeof rawUrl !== "string" ||
    rawUrl.length === 0 ||
    rawUrl.length > MAX_URL_LENGTH
  ) {
    throw new ApiError(400, "Remote URL is invalid or too long");
  }

  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new ApiError(400, "A valid remote URL is required");
  }

  /*
   * Only HTTP/HTTPS are allowed.
   */
  if (!/^https?:$/.test(parsed.protocol)) {
    throw new ApiError(400, "Only HTTP and HTTPS URLs are allowed");
  }

  /*
   * Prevent URLs such as:
   *
   * https://username:password@example.com
   */
  if (parsed.username || parsed.password) {
    throw new ApiError(400, "URLs containing credentials are not allowed");
  }

  /*
   * Only standard HTTP/HTTPS ports.
   */
  if (!ALLOWED_PORTS.has(parsed.port)) {
    throw new ApiError(400, "Only standard HTTP/HTTPS ports are allowed");
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");

  /*
   * Explicit hostname blocks.
   */
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost")) {
    throw new ApiError(400, "This remote host is not allowed");
  }

  /*
   * If the hostname itself is an IP address, validate it directly.
   */
  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname)) {
      throw new ApiError(
        400,
        "Private or internal network addresses are not allowed",
      );
    }

    return parsed;
  }

  /*
   * Resolve ALL addresses.
   *
   * This is important for SSRF protection:
   * if a hostname resolves to both a public and private address,
   * reject it instead of selecting the public one.
   */
  let addresses;

  try {
    addresses = await dns.lookup(hostname, {
      all: true,
      verbatim: true,
    });
  } catch {
    throw new ApiError(400, "The remote host could not be resolved");
  }

  if (!Array.isArray(addresses) || addresses.length === 0) {
    throw new ApiError(400, "The remote host could not be resolved");
  }

  const hasBlockedAddress = addresses.some(
    ({ address }) => !address || isBlockedIp(address),
  );

  if (hasBlockedAddress) {
    throw new ApiError(
      400,
      "The remote host resolves to a private or internal address",
    );
  }

  return parsed;
};

/* -------------------------------------------------------------------------- */
/* SAFE DNS LOOKUP                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Node's custom `lookup` callback has two relevant forms:
 *
 * Normal:
 *   callback(error, address, family)
 *
 * With `{ all: true }`:
 *   callback(error, [{ address, family }, ...])
 *
 * The previous implementation did not correctly handle the `all` form.
 */
const createSafeLookup =
  (expectedHostname) => (lookupHostname, lookupOptions, callback) => {
    if (lookupHostname !== expectedHostname) {
      callback(new Error("Blocked remote destination"));
      return;
    }

    dns
      .lookup(expectedHostname, {
        all: true,
        verbatim: true,
      })
      .then((addresses) => {
        if (!Array.isArray(addresses) || addresses.length === 0) {
          callback(new Error("No usable remote address"));
          return;
        }

        /*
         * Revalidate the DNS result immediately before the connection.
         */
        const invalidAddress = addresses.some(
          ({ address }) => !address || isBlockedIp(address),
        );

        if (invalidAddress) {
          callback(new Error("Blocked remote destination"));
          return;
        }

        const options =
          lookupOptions && typeof lookupOptions === "object"
            ? lookupOptions
            : {};

        const requestedFamily = Number(options.family || 0);

        /*
         * If Node requested a specific address family,
         * honor it.
         */
        let usableAddresses = addresses;

        if (requestedFamily === 4 || requestedFamily === 6) {
          usableAddresses = addresses.filter(
            ({ family }) => Number(family) === requestedFamily,
          );
        }

        if (usableAddresses.length === 0) {
          callback(new Error("No usable remote address"));
          return;
        }

        /*
         * Prefer IPv4 where possible.
         *
         * This avoids many local Windows/Node IPv6 connection
         * issues while still allowing IPv6 when IPv4 isn't available.
         */
        const selected =
          usableAddresses.find(({ family }) => Number(family) === 4) ||
          usableAddresses.find(({ family }) => Number(family) === 6) ||
          usableAddresses[0];

        /*
         * IMPORTANT:
         *
         * If Node asks for all addresses, return an array.
         *
         * Otherwise return:
         * callback(null, address, family)
         */
        if (options.all === true) {
          callback(
            null,
            usableAddresses.map(({ address, family }) => ({
              address,
              family: Number(family),
            })),
          );

          return;
        }

        callback(null, selected.address, Number(selected.family));
      })
      .catch((error) => {
        callback(error);
      });
  };

/* -------------------------------------------------------------------------- */
/* REMOTE HTTP REQUEST                                                        */
/* -------------------------------------------------------------------------- */

const requestUrl = ({ parsedUrl, type, maxBytes }) =>
  new Promise((resolve, reject) => {
    const transport = parsedUrl.protocol === "https:" ? https : http;

    const hostname = parsedUrl.hostname.replace(/^\[|\]$/g, "");

    const request = transport.request(
      {
        protocol: parsedUrl.protocol,
        hostname,

        /*
         * Don't manually replace hostname with the resolved IP.
         *
         * TLS still needs the original hostname for certificate
         * verification/SNI.
         */
        port: parsedUrl.port || undefined,

        path: `${parsedUrl.pathname}${parsedUrl.search}`,

        method: "GET",

        headers: {
          Accept:
            type === "cover"
              ? "image/jpeg,image/png,image/webp,image/*;q=0.8"
              : type === "pdf"
                ? "application/pdf,application/octet-stream;q=0.8"
                : "application/epub+zip,application/octet-stream;q=0.8",

          "User-Agent": "E-Library-Remote-File-Importer/1.0",
        },

        timeout: REQUEST_TIMEOUT_MS,

        lookup: createSafeLookup(hostname),

        maxHeaderSize: 16 * 1024,

        ...(parsedUrl.protocol === "https:" && {
          servername: hostname,
        }),
      },

      (response) => {
        const statusCode = response.statusCode;

        /* ------------------------------------------------------------------ */
        /* REDIRECT                                                            */
        /* ------------------------------------------------------------------ */

        if ([301, 302, 303, 307, 308].includes(statusCode)) {
          const location = response.headers.location;

          response.resume();

          resolve({
            redirect: location || null,
            status: statusCode,
          });

          return;
        }

        /* ------------------------------------------------------------------ */
        /* HTTP ERROR                                                          */
        /* ------------------------------------------------------------------ */

        if (!statusCode || statusCode < 200 || statusCode >= 300) {
          response.resume();

          reject(
            new ApiError(
              400,
              `Remote server returned HTTP ${
                statusCode || "an invalid response"
              }`,
            ),
          );

          return;
        }

        /* ------------------------------------------------------------------ */
        /* CONTENT LENGTH                                                      */
        /* ------------------------------------------------------------------ */

        const declaredLength = response.headers["content-length"];

        if (
          declaredLength &&
          Number.isFinite(Number(declaredLength)) &&
          Number(declaredLength) > maxBytes
        ) {
          response.destroy();

          reject(
            new ApiError(
              413,
              `Remote file is too large. Max size is ${
                maxBytes / (1024 * 1024)
              }MB.`,
            ),
          );

          return;
        }

        /* ------------------------------------------------------------------ */
        /* STREAM DOWNLOAD                                                     */
        /* ------------------------------------------------------------------ */

        const chunks = [];
        let total = 0;
        let settled = false;

        response.on("data", (chunk) => {
          if (settled) return;

          total += chunk.length;

          /*
           * Enforce the limit even if the remote server lies
           * about Content-Length or uses chunked encoding.
           */
          if (total > maxBytes) {
            settled = true;

            response.destroy();

            reject(
              new ApiError(
                413,
                `Remote file is too large. Max size is ${
                  maxBytes / (1024 * 1024)
                }MB.`,
              ),
            );

            return;
          }

          chunks.push(chunk);
        });

        response.on("end", () => {
          if (settled) return;

          settled = true;

          if (total === 0) {
            reject(
              new ApiError(400, "The remote server returned an empty file"),
            );

            return;
          }

          resolve({
            buffer: Buffer.concat(chunks, total),

            contentType: String(response.headers["content-type"] || "")
              .split(";")[0]
              .trim()
              .toLowerCase(),
          });
        });

        response.on("error", (error) => {
          if (settled) return;

          settled = true;

          reject(
            new ApiError(502, `Remote file download failed: ${error.message}`),
          );
        });
      },
    );

    /* ---------------------------------------------------------------------- */
    /* TIMEOUT                                                                */
    /* ---------------------------------------------------------------------- */

    request.on("timeout", () => {
      request.destroy(new Error("Remote file download timed out"));
    });

    /* ---------------------------------------------------------------------- */
    /* REQUEST ERROR                                                          */
    /* ---------------------------------------------------------------------- */

    request.on("error", (error) => {
      if (error.message === "Remote file download timed out") {
        reject(new ApiError(504, "Remote file download timed out"));

        return;
      }

      if (error.message === "Blocked remote destination") {
        reject(
          new ApiError(
            400,
            "The remote host resolves to a private or internal address",
          ),
        );

        return;
      }

      /*
       * Keep the underlying error because it is useful for diagnosing
       * DNS/TLS/network problems.
       */
      reject(
        new ApiError(
          502,
          `Could not download the remote file: ${error.message}`,
        ),
      );
    });

    request.end();
  });

/* -------------------------------------------------------------------------- */
/* FILENAME                                                                   */
/* -------------------------------------------------------------------------- */

const getFilenameFromUrl = (url, fallback) => {
  try {
    const pathname = new URL(url).pathname;

    const lastSegment = decodeURIComponent(pathname.split("/").pop() || "");

    const cleaned = lastSegment.replace(/[\\/:*?"<>|\x00-\x1f]/g, "").trim();

    return cleaned.slice(0, 180) || fallback;
  } catch {
    return fallback;
  }
};

/* -------------------------------------------------------------------------- */
/* PUBLIC API                                                                 */
/* -------------------------------------------------------------------------- */

export const fetchRemoteFile = async ({ url, type }) => {
  const limits = FILE_LIMITS[type];

  if (!limits) {
    throw new ApiError(400, "Unsupported remote file type");
  }

  let currentUrl = url;

  for (
    let redirectCount = 0;
    redirectCount <= MAX_REDIRECTS;
    redirectCount += 1
  ) {
    /*
     * Validate EVERY URL.
     *
     * This is especially important for redirects because:
     *
     * public.com
     *     ↓
     * http://127.0.0.1
     *
     * must be blocked.
     */
    const parsedUrl = await parseAndValidateUrl(currentUrl);

    const result = await requestUrl({
      parsedUrl,
      type,
      maxBytes: limits.maxSizeMB * 1024 * 1024,
    });

    /* ---------------------------------------------------------------------- */
    /* REDIRECT                                                               */
    /* ---------------------------------------------------------------------- */

    if (result.redirect !== undefined) {
      if (redirectCount === MAX_REDIRECTS) {
        throw new ApiError(
          400,
          "Too many redirects while fetching the remote file",
        );
      }

      if (!result.redirect) {
        throw new ApiError(
          502,
          "The remote server returned an invalid redirect",
        );
      }

      currentUrl = new URL(result.redirect, parsedUrl).toString();

      continue;
    }

    /* ---------------------------------------------------------------------- */
    /* SUCCESS                                                                */
    /* ---------------------------------------------------------------------- */

    return {
      buffer: result.buffer,

      contentType: result.contentType,

      originalName: getFilenameFromUrl(parsedUrl, `remote-${type}`),
    };
  }

  throw new ApiError(400, "Unable to fetch remote file");
};
