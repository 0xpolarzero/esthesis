import { Fragment, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Divider, Dropdown, Tooltip } from 'antd';
import { AiOutlineInfoCircle, AiOutlineMenu } from 'react-icons/ai';
import { BsThermometerHigh, BsThermometerLow } from 'react-icons/bs';
import { CiDark, CiLight } from 'react-icons/ci';
import stores from '@/stores';

const Nav = ({ type = 'default' }) => {
  const { theme, updateTheme, highGraphics, toggleHighGraphics } =
    stores.useConfig((state) => ({
      theme: state.theme,
      updateTheme: state.updateTheme,
      highGraphics: state.highGraphics,
      toggleHighGraphics: state.toggleHighGraphics,
    }));
  const router = useRouter();

  return (
    <header className='nav'>
      <div className='title'>
        {type === 'shared' ? null : (
          <>
            sound<span className='emphasize'>swarm</span>
          </>
        )}
      </div>

      <div className='links'>
        {/* <Links /> */}
        {/* Icons */}
        {type === 'shared' ? (
          <>
            <a onClick={() => router.push('/')}>app</a>
            <Divider type='vertical' />
          </>
        ) : null}
        <Tooltip
          title={
            <>
              powered by{' '}
              <a
                href='https://www.spinamp.xyz/'
                target='_blank'
                rel='noreferrer'>
                Spinamp
              </a>
              <br />
              built by{' '}
              <a href='https://polarzero.xyz/' target='_blank' rel='noreferrer'>
                polarzero
              </a>
            </>
          }>
          <AiOutlineInfoCircle size={20} />
        </Tooltip>
        <Divider type='vertical' />
        <Tooltip
          title={
            highGraphics
              ? 'click to prefer performance'
              : 'click to prefer high graphics (effects)'
          }>
          {highGraphics ? (
            <BsThermometerHigh size={20} onClick={toggleHighGraphics} />
          ) : (
            <BsThermometerLow size={20} onClick={toggleHighGraphics} />
          )}
        </Tooltip>
        <Divider type='vertical' />
        {theme === 'dark' ? (
          <CiDark size={20} onClick={() => updateTheme('light')} />
        ) : (
          <CiLight size={20} onClick={() => updateTheme('dark')} />
        )}
      </div>
    </header>
  );
};

export default Nav;
