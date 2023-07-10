export const authConfig = {
  authority: 'http://zitadel.cloud.ut.ee', //Replace with your issuer URL
  client_id: '221885342960123907@pix', //Replace with your client id
  redirect_uri: 'http://pix.cloud.ut.ee/auth/callback/zitadel',
  response_type: 'code',
  scope: 'openid profile email',
  post_logout_redirect_uri: 'http://pix.cloud.ut.ee/',
  userinfo_endpoint: 'http://zitadel.cloud.ut.ee/oidc/v1/userinfo', //Replace with your user-info endpoint
  response_mode: "query" as const,
  code_challenge_method: 'S256',
};

export const storageconfig = "oidc.user:http://zitadel.cloud.ut.ee:221885342960123907@pix"

