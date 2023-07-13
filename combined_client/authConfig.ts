console.log(import.meta.env.VITE_REDIRECT_URI)
export const authConfig = {
  authority: 'http://zitadel.cloud.ut.ee', //Replace with your issuer URL
  client_id: '221885342960123907@pix', //Replace with your client id
  redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  response_type: 'code',
  scope: 'openid profile email',
  post_logout_redirect_uri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI,
  userinfo_endpoint: 'http://zitadel.cloud.ut.ee/oidc/v1/userinfo', //Replace with your user-info endpoint
  response_mode: "query" as const,
  code_challenge_method: 'S256',
};

export const storageconfig = import.meta.env.VITE_STORAGECONFIG

