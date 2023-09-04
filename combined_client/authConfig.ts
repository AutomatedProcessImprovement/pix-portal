// console.log(import.meta.env.VITE_REDIRECT_URI)
// console.log(import.meta.env.VITE_ZITADEL_CLIENT_ID)
// console.log(import.meta.env.VITE_ZITADEL_USER_INFO_ENDPOINT)

export const authConfig = {
  authority: import.meta.env.VITE_ZITADEL_BASE_URL, //Replace with your issuer URL
  client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID, //Replace with your client id
  redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  response_type: 'code',
  scope: 'openid profile email',
  post_logout_redirect_uri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI,
  userinfo_endpoint: import.meta.env.VITE_ZITADEL_USER_INFO_ENDPOINT, //Replace with your user-info endpoint
  response_mode: "query" as const,
  code_challenge_method: 'S256',
};

export const storageconfig = import.meta.env.VITE_STORAGECONFIG

