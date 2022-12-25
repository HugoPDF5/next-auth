import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

let cookies = parseCookies();
let isRefreshing = false
let failedRequestQueue = [];

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies["next-auth.token"]}`,
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (error.response.data?.code === "token.expired") {
        cookies = parseCookies();

        const { "next-auth.refreshToken": refreshToken } = cookies;
        const originalConfig = error.config

        if(!isRefreshing){
          isRefreshing = true

          api.post("/refresh", {
            refreshToken,
          })
          .then((response) => {
            const { token } = response.data;

            setCookie(undefined, "next-auth.token", token, {
              maxAge: 60 * 60,
              path: "/",
            });
            
            setCookie(undefined, "next-auth.refreshToken", response.data.refreshToken, {
              maxAge: 60 * 60,
              path: "/",
            });

            api.defaults.headers['Authorization'] = `Bearer ${token}`
            failedRequestQueue.forEach(req => req.onSuccess(token))
            failedRequestQueue = []

          }).finally(() => {
            isRefreshing= false
          })
        }

        return new Promise((resolve, reject) => {
          failedRequestQueue.push({
            onSuccess: (token: string) => {
              originalConfig!.headers!['Authorization'] = `Bearer ${token}`

              resolve(api(originalConfig!))
            } ,
            onFailure: (err: AxiosError) => {
              reject(err)
            }
          })
        })
      } else {
      }
    }
  }
);
