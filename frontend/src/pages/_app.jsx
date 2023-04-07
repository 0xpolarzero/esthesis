import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/config';
import Layout from '@/components/dom/Layout';
import stores from '@/stores';
import '@/styles/index.css';
// Lib
import '@rainbow-me/rainbowkit/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import hooks from '@/hooks';
import { toast } from 'react-toastify';

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: true });

export default function App({ Component, pageProps = { title: 'polarzero' } }) {
  const { initTheme /* setHighGraphics */ } = stores.useConfig((state) => ({
    initTheme: state.initTheme,
    // setHighGraphics: state.setHighGraphics,
  }));
  const { fetchTracks, fetchPlatforms } = stores.useSpinamp((state) => ({
    fetchTracks: state.fetchTracks,
    fetchPlatforms: state.fetchPlatforms,
  }));
  const { isMobile } = hooks.useWindowSize();

  const layout = useRef();
  const loader = useRef();

  useEffect(() => {
    if (typeof window !== 'undefined' && loader.current)
      loader.current.classList.add('hidden');

    initTheme();
    fetchTracks().then(() => fetchPlatforms());
  }, [initTheme, fetchTracks, fetchPlatforms]);

  useEffect(() => {
    if (isMobile)
      toast.info(
        'please note that the app is currently not optimized for mobile and is highly prone to errors',
        { autoClose: false, position: 'bottom-left' },
      );
  }, [isMobile]);

  return (
    <>
      <Header title={pageProps.title} />

      <Layout ref={layout} {...pageProps}>
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
