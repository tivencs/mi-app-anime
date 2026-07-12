declare function getAnimeServers(animeId: string, chapter: number): Promise<string[] | null>;

type StringOrNull = string | null;
type StringArrayOrNull = string[] | null;

interface AnimeInfo {
    type: StringOrNull;
    genre: StringArrayOrNull;
    studios: StringArrayOrNull;
    demography: StringArrayOrNull;
    languages: StringOrNull;
    episodes: StringOrNull;
    duration: StringOrNull;
    aired: StringOrNull;
    status: StringOrNull;
    quality: StringOrNull;
}
interface RootAnime {
    extra: AnimeInfo | null;
}
type ReturnType = Promise<RootAnime | null>;
declare function getExtraInfo(animeSlug: string): ReturnType;

interface Anime {
    id: string;
    slug: string;
    title: string;
    altertitles: {
        language: string;
        title: string;
    }[];
    synopsis: string;
    status: string;
    episodes: string;
    image: string;
    thumbnail: string;
    type: string;
    rel_id: {
        [key: string]: string[];
    };
    coincidencias: string;
}
interface AnimeTypes {
    [key: string]: string;
}
interface SearchResults {
    animes: Anime[];
    anime_types: AnimeTypes;
}
type SearchReturnType = Promise<SearchResults | null>;
declare function search(q: string): SearchReturnType;

declare const _default: {
    getAnimeServers: typeof getAnimeServers;
    getExtraInfo: typeof getExtraInfo;
    search: typeof search;
};

export { _default as default };
