import axios, { AxiosInstance, CreateAxiosDefaults } from "axios";
import { TypedAxios, RouteDef } from "typed-axios-instance";
import getEnv from "src/Env";

export let Api: AxiosInstance | null = null;

type RouteDefArray<T extends RouteDef[]> = T;

// This is just a wrapper to ensure that ApiRoutes is an array of RouteDefs.
// TypeScript will error if it is not.
export type ApiRoutes = RouteDefArray<[]>;
export default function getApi(options: CreateAxiosDefaults={}, createNew=false): TypedAxios<ApiRoutes> {
    if (!createNew && Api) {
        return Api;
    }

    const env = getEnv();
    Api = axios.create({
        withCredentials: true,
        ...options,
        baseURL: env.isProd ? env.prodApiUrl! : env.devApiUrl
    });

    return Api;
}