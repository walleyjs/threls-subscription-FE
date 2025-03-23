export const config = {
         api: {
           baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
         },
         auth: {
           tokenStorageKey: "tokens",
           userStorageKey: "user",
         },
       }
       
       