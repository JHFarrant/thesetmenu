# thesetmenu.co.uk
> Use your Spotify history to discover your Glasto 23 Set Menu

<img src="https://github.com/JHFarrant/thesetmenu/assets/3439407/bf4cd0a1-8c0c-4e9a-a397-0ba1a2e59567" width="200px">
<img src="https://github.com/JHFarrant/thesetmenu/assets/3439407/0086325f-69b4-42f1-a43e-01dbfdfd6d10" width="200px">
<img src="https://github.com/JHFarrant/thesetmenu/assets/3439407/95af02e1-4952-4190-85b0-2537c292490c" width="200px">

### How it works

1. You provide thesetmenu.co.uk with OAuth access to your Spotify account. scopes requested: `user-top-read` `user-follow-read`
2. The thesetmenu.co.uk fetches your top 100 artists, top 100 tracks (and their artists) & the artists you follow
3. The list of Spotify artist ids is compared against a list of artists performing at Glastonbury
4. The matched artist's performances are listed in chronological order

*Try it out [here](https://thesetmenu.co.uk)*

> All the above steps are performed in your browser, your spotify history does not leave your browser

## Getting Started

> This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.
