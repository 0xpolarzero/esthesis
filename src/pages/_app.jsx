import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/config';
import Layout from '@/components/dom/Layout';
import '@/styles/index.css';
import stores from '@/stores';

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: true });

export default function App({ Component, pageProps = { title: 'polarzero' } }) {
  const initTheme = stores.useConfig((state) => state.initTheme);
  const { fetchTracks, fetchRemainingTracks } = stores.useSpinamp((state) => ({
    fetchTracks: state.fetchTracks,
    fetchRemainingTracks: state.fetchRemainingTracks,
  }));

  const layout = useRef();
  const loader = useRef();

  useEffect(() => {
    if (typeof window !== 'undefined' && loader.current)
      loader.current.classList.add('hidden');

    initTheme();
    fetchTracks();
    fetchRemainingTracks();
  }, [initTheme, fetchTracks, fetchRemainingTracks]);

  return (
    <>
      <Header title={pageProps.title} />

      <Layout ref={layout}>
        {Component?.canvas && (
          <Scene
            className='pointer-events-none'
            // eventSource={layout}
            eventPrefix='client'>
            {Component.canvas(pageProps)}
          </Scene>
        )}
        <Component {...pageProps} />
      </Layout>

      <div ref={loader} id='loader'>
        <div className='loader' />
      </div>
    </>
  );
}
