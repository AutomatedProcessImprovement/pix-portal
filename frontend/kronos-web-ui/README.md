This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Install with `npm`

```bash
npm install  # use --legacy-peer-deps if you get dependencies errors
```

Build the project:

```bash
npm run build  # or 
next build --experimental-turbo  # for faster builds
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000/kronos/results/:jobId](http://localhost:3000/kronos/results/:jobId) with your browser to see the result. Use the `jobId` of a job (processing request) that has been submitted to the PIX Portal. This `jobId` is also part of the table name in the Kronos database. The table must already exist in the database.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Google fonts.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deployment

The application is deployed as part of the PIX Portal. However, to deploy it separately, run:

```bash
docker build -t kronos-web-ui .
docker run -p 3000:3000 kronos-web-ui
```
