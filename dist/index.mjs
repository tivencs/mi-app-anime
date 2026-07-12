import * as cheerio from 'cheerio';
import cheerio__default from 'cheerio';
import _ from 'lodash';
import ky from 'ky';
import qs from 'qs';

class CustomHTTPError extends Error {
}
async function makeRequest(url, responseType = "json", options = {}) {
  try {
    const response = await ky(url, options);
    if (!response.ok)
      throw new CustomHTTPError(`Fetch error: ${response.statusText}`);
    return await response[`${responseType}`]();
  } catch (error) {
    throw new Error(`Error making request to ${url}: ${error}`);
  }
}

const config = {
  baseURL: "https://jkanime.net/",
  remoteServerURL: "https://c4.jkdesu.com"
};

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class ToolKit {
}
__publicField(ToolKit, "buildQuery", (obj) => {
  const query = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== void 0 && obj[key] !== null && obj[key] !== "")
      query[key] = obj[key];
  }
  return qs.stringify(query, { encode: false });
});
__publicField(ToolKit, "extractNumberFromString", (inputString) => {
  const match = _.parseInt(_.find(inputString.match(/\d+/), _.identity));
  return _.isFinite(match) ? match : null;
});

function transformURL(servers) {
  const options = _.map(servers, (serverOption) => `https://jkanime.net/c1.php?${ToolKit.buildQuery({ u: serverOption.remote, s: _.toLower(serverOption.server) })}`);
  return options;
}
async function getRemoteServerOptions(servers) {
  return transformURL(servers);
}

async function getAnimeServers(animeId, chapter) {
  const requestOpts = {
    path: `${config.baseURL}${animeId}/${chapter}`,
    responseType: "text"
  };
  const responsePromise = await makeRequest(requestOpts.path, requestOpts.responseType, { method: "get" });
  if (!responsePromise)
    return null;
  const $ = cheerio__default.load(responsePromise);
  const scriptSrc = $("script").filter((_2, elem) => $(elem).text().includes("var servers")).text().trim();
  const dynamicSrcMatch = scriptSrc.match(/var servers = (\[.*?\]);/s);
  if (!dynamicSrcMatch)
    return null;
  const dynamicSrc = _.get(dynamicSrcMatch, "[1]", null);
  if (!dynamicSrc)
    return null;
  const servers = JSON.parse(dynamicSrc);
  const remoteServerOptionsPromise = getRemoteServerOptions(servers);
  const [, remoteServerJsURL] = await Promise.all([responsePromise, remoteServerOptionsPromise]);
  return remoteServerJsURL;
}

const propsToEnglish = {
  tipo: "type",
  genero: "genre",
  studios: "studios",
  demografia: "demography",
  idiomas: "languages",
  episodios: "episodes",
  episodeList: "",
  duracion: "duration",
  emitido: "aired",
  estado: "status",
  calidad: "quality",
  promo: "promo"
};
function buildPromoURL($) {
  const id = $(".animeTrailer").attr("data-yt");
  if (!id)
    return null;
  return `https://youtube.com/watch?${ToolKit.buildQuery({ v: id })}`;
}
async function getExtraInfo(animeSlug) {
  const requestOpts = {
    path: `${config.baseURL}${animeSlug}`,
    responseType: "text"
  };
  const response = await makeRequest(requestOpts.path, requestOpts.responseType, { method: "get" });
  if (!response)
    return { extra: null };
  const $ = cheerio__default.load(response);
  const ul = $(".aninfo ul");
  const extra = {};
  ul.find("li").each((_, element) => {
    const span = $(element).find("span").first();
    const key = span.text().trim().replace(":", "").toLowerCase();
    const englishKey = propsToEnglish[key] || key;
    if (key === "genero" || key === "studios" || key === "demografia") {
      const valueList = [];
      $(element).find("a").each((_2, anchor) => {
        valueList.push($(anchor).text().trim());
      });
      extra[englishKey] = valueList;
    } else {
      let value = $(element).text().replace(span.text(), "").trim() ?? null;
      if (/^\d+$/.test(value)) {
        value = Number.parseInt(value, 10);
        extra.episodeList = Array.from({ length: value }, (v, k) => ({
          key: animeSlug,
          value: k + 1
        }));
      }
      extra[englishKey] = value;
    }
    if (key === "estado" && !extra[englishKey])
      extra[englishKey] = span.next().text().trim();
    if (!extra[englishKey])
      extra[englishKey] = null;
  });
  const promoURL = buildPromoURL($);
  extra.promo = promoURL;
  const result = {
    extra
  };
  return result;
}

async function search(q) {
  const searchURL = `${config.baseURL}buscar/?q=${encodeURIComponent(q)}`;
  const html = await makeRequest(searchURL, "text", { method: "get" });
  if (!html)
    return null;
  const $ = cheerio.load(html);
  const animes = [];
  $(".anime__item").each((__index, element) => {
    const linkEl = $(element).find("a");
    const imgEl = $(element).find(".anime__item__pic");
    const titleEl = $(element).find("h5 a");
    const href = linkEl.attr("href") || "";
    const slug = href.split("/").filter(Boolean).pop() || "";
    const title = titleEl.text().trim();
    const image = imgEl.attr("data-setbg") || "";
    if (slug) {
      animes.push({
        id: slug,
        slug,
        title,
        altertitles: [],
        synopsis: "",
        status: "",
        episodes: "",
        image,
        thumbnail: image,
        type: "",
        rel_id: {},
        coincidencias: ""
      });
    }
  });
  return {
    animes,
    anime_types: {}
  };
}

const index = {
  getAnimeServers,
  getExtraInfo,
  search
};

export { index as default };
