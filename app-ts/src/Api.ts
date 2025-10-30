import axios, { CreateAxiosDefaults } from "axios";
import { TypedAxios, RouteDef } from "typed-axios-instance";
import getEnv from "src/Env";
import { setupCache, CacheOptions, AxiosCacheInstance, defaultKeyGenerator } from 'axios-cache-interceptor';
import { Override, omit } from "@ptolemy2002/ts-utils";
import { minutesToMilliseconds } from "date-fns";

export const ApiInstances: Record<string, AxiosCacheInstance> = {};
export const ApiCacheManagerInstances: Record<string, ApiCacheManager> = {};

type RouteDefArray<T extends RouteDef[]> = T;

// This is just a wrapper to ensure that ApiRoutes is an array of RouteDefs.
// TypeScript will error if it is not.
export type ApiRoutes = RouteDefArray<[]>;

export const RouteTags = {
    // Define a string value for each route tag here.
    // This allows you to invalidate groups of routes at once
    // without making them equivalent to each other in terms of caching.
} as const;

export type AxiosTypedCacheInstance = Override<AxiosCacheInstance, TypedAxios<ApiRoutes>>;

export class ApiCacheManager {
    requestIdsByTag: Record<string, string[]> = {};

    hasTag(tag: string): boolean {
        return (tag in this.requestIdsByTag) && this.requestIdsByTag[tag]!.length > 0;
    }

    initTag(tag: string) {
        if (!this.hasTag(tag)) {
            this.requestIdsByTag[tag] = [];
        }

        return this.requestIdsByTag[tag]!;
    }

    clearTag(tag: string): void {
        if (this.hasTag(tag)) {
            delete this.requestIdsByTag[tag];
        }
    }

    cleanTags(): void {
        for (const tag in this.requestIdsByTag) {
            if (this.requestIdsByTag[tag]!.length === 0) {
                this.clearTag(tag);
            }
        }
    }

    getIdsByTag(tag: string): string[] {
        this.initTag(tag);
        return this.requestIdsByTag[tag]!;
    }

    hasIdInTag(tag: string, requestId: string): boolean {
        if (!this.hasTag(tag)) return false;
        return this.getIdsByTag(tag).includes(requestId);
    }

    addId(tag: string, requestId: string): void {
        this.initTag(tag).push(requestId);
    }

    async removeFromTag(api: AxiosTypedCacheInstance, tag: string, requestId: string): Promise<void> {
        if (!this.hasIdInTag(tag, requestId)) return;
        await api.storage.remove(requestId);
        this.requestIdsByTag[tag] = this.requestIdsByTag[tag]!.filter(id => id !== requestId);
        this.cleanTags();
    }

    async removeByTag(api: AxiosTypedCacheInstance, tag: string): Promise<void> {
        if (!this.hasTag(tag)) return;

        const ids = this.getIdsByTag(tag);
        for (const id of ids) {
            await api.storage.remove(id);
        }

        this.clearTag(tag);
    }

}

export type GetAPIOptions = {
    key?: string,
    options?: Omit<CreateAxiosDefaults, "baseURL">,
    cacheOptions?: Omit<CacheOptions, "generateKey">,
    createNew?: boolean
};

export default function getApi(
    {
        key="default",
        options,
        cacheOptions= {
            ttl: minutesToMilliseconds(5),
        },
        createNew = false
    }: GetAPIOptions = {}
): AxiosTypedCacheInstance {
    const Api = ApiInstances[key];

    if (!createNew && Api) {
        return Api;
    }

    const env = getEnv();
    const result = setupCache(axios.create({
        withCredentials: true,
        ...options,
        baseURL: env.apiURL + "/api/v1",
    }), {
        ...cacheOptions,
        generateKey: (config) => {
            // Generate a key using the default method with an instance of the config that
            // does not have the id specified so that it will generate unique keys for each request
            const configWithoutId = omit(config, "id");
            const generatedKey = defaultKeyGenerator(configWithoutId);

            // If the config has an id, add the generated key to the cache manager
            if (config.id) {
                const cm = getApiCacheManager({ key });
                cm.addId(config.id, generatedKey);
            }

            return generatedKey;
        }
    });

    result.interceptors.request.use((config) => {
        if (!config.url) return config;

        // Replace any [param] in the URL with the corresponding value from params
        let url = config.url;
        Object.entries(config.params ?? {}).forEach(([key, value]) => {
            url = url.replaceAll(`[${key}]`, encodeURIComponent(String(value)));
        });

        return {
            ...config,
            url
        };
    });

    
    ApiInstances[key] = result;
    return result;
}

export type GetApiCacheManagerOptions = {
    key?: string,
    createNew?: boolean
};

export function getApiCacheManager({ key = "default", createNew = false }: GetApiCacheManagerOptions = {}): ApiCacheManager {
    if (createNew || !(key in ApiCacheManagerInstances)) {
        ApiCacheManagerInstances[key] = new ApiCacheManager();
    }

    return ApiCacheManagerInstances[key]!;
}