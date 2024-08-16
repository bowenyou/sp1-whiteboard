"use client";
import Head from 'next/head';
import Whiteboard from '../components/Whiteboard';

const Home: React.FC = () => {
  return (
    <div>
      <Head>
        <title>Whiteboard App</title>
        <meta name="description" content="A simple whiteboard app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Whiteboard</h1>
        <Whiteboard />
      </main>
    </div>
  );
};

export default Home;

