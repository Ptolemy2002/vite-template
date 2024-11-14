import { z } from 'zod';
import { createContext, useContext } from 'react';

function nullableUrl(defaultValue?: string | null) {
    const result = z.union([
        z.string().trim().url(),
        z.literal(""),
        z.null()
    ]);

    if (defaultValue !== undefined) {
        return result
            .transform(value => value === "" ? defaultValue : value)
            .optional()
            .default(defaultValue);
    }

    return result;
}


function url(defaultValue?: string) {
    const result = z.union([
        z.string().trim().url(),
        z.literal("")
    ]);

    if (defaultValue !== undefined) {
        return result
            .transform(value => value === "" ? defaultValue : value)
            .optional()
            .default(defaultValue);
    }

    return result;
}

export const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number()
        .int({message: "PORT must be an integer"})
        .positive({message: "PORT must be positive"})
        .default(8080),
    REACT_APP_DEV_API_URL: url("http://localhost:8080"),
    REACT_APP_PROD_API_URL: nullableUrl(null),
    REACT_APP_DEV_CLIENT_URL: url("http://localhost:3000"),
    REACT_APP_PROD_CLIENT_URL: nullableUrl(null),

    // Additional environment variables here
});

export type EnvType = {
    nodeEnv: "development" | "production" | "test",
    isProd: boolean,
    isDev: boolean,
    isTest: boolean,
    port: number,
    devApiUrl: string,
    prodApiUrl: string | null,
    devClientUrl: string,
    prodClientUrl: string | null,

    // Additional environment variables here
};
let Env: z.infer<typeof EnvSchema> | null = null;

export default function getEnv(): EnvType {
    if (Env === null) Env = EnvSchema.parse(process.env);
    return Object.freeze({
        nodeEnv: Env.NODE_ENV,
        isProd: Env.NODE_ENV === "production",
        isDev: Env.NODE_ENV === "development",
        isTest: Env.NODE_ENV === "test",
        port: Env.PORT,
        devApiUrl: Env.REACT_APP_DEV_API_URL,
        prodApiUrl: Env.REACT_APP_PROD_API_URL,
        devClientUrl: Env.REACT_APP_DEV_CLIENT_URL,
        prodClientUrl: Env.REACT_APP_PROD_CLIENT_URL
    });
}

export const EnvContext = createContext<EnvType | undefined>(undefined);

export function EnvProvider({ children }: { children: React.ReactNode }) {
    return <EnvContext.Provider value={getEnv()}>{children}</EnvContext.Provider>;
}

export function useEnv() {
    const env = useContext(EnvContext);
    if (env === undefined) throw new Error("EnvProvider not found");
    return env;
}