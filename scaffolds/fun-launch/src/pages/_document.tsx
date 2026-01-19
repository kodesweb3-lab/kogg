import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Kogaion - Summon Tokens. Ascend Markets. The ritual begins here. Launch your token on Solana with the power of the pack." />
        <meta property="og:title" content="Kogaion - Token Launchpad" />
        <meta property="og:description" content="Summon Tokens. Ascend Markets. The ritual begins here." />
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
