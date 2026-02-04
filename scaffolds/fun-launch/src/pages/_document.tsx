import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0f1114" />
        <meta name="description" content="Kogaion - The Agent Economy Launchpad. Launch tokens on Solana with API, agents, and marketplace." />
        <meta property="og:title" content="Kogaion - Token Launchpad" />
        <meta property="og:description" content="The Agent Economy Launchpad. Launch tokens on Solana." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Kogaion" />
        <meta name="twitter:description" content="The most based token launchpad on Solana" />
        <link rel="icon" href="/favicon.ico" />
        <Script src="https://terminal.jup.ag/main-v4.js" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
