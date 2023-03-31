import { Fragment, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Divider, Dropdown, Tooltip } from 'antd';
import { AiOutlineInfoCircle, AiOutlineMenu } from 'react-icons/ai';
import { CiDark, CiLight } from 'react-icons/ci';
import { User } from './Main';
import stores from '@/stores';
import hooks from '@/hooks';
import Image from 'next/image';

const Nav = ({ type = 'default' }) => {
  const { theme, updateTheme /* highGraphics, toggleHighGraphics */ } =
    stores.useConfig((state) => ({
      theme: state.theme,
      updateTheme: state.updateTheme,
      // highGraphics: state.highGraphics,
      // toggleHighGraphics: state.toggleHighGraphics,
    }));
  const { isMobile, isWideScreen } = hooks.useWindowSize();
  const router = useRouter();

  return (
    <header className='nav'>
      <div className='title'>
        {type === 'shared' ? null : (
          <>
            {!isMobile ? (
              <span className='with-icon'>
                <Image
                  src={theme === 'dark' ? '/logo.png' : '/logo-light.png'}
                  alt='logo'
                  width={40}
                  height={40}
                />
                esthesis
              </span>
            ) : (
              'esthesis'
            )}
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
        ) : (
          <>
            <User />
            {isWideScreen ? null : <Divider type='vertical' />}
          </>
        )}
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
          {isWideScreen ? (
            <a className='with-icon'>
              <AiOutlineInfoCircle size={20} />
              more
            </a>
          ) : (
            <AiOutlineInfoCircle size={20} />
          )}
        </Tooltip>
        {/* <Divider type='vertical' />
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
        </Tooltip> */}
        {isWideScreen ? null : <Divider type='vertical' />}
        {theme === 'dark' ? (
          isWideScreen ? (
            <a className='with-icon' onClick={() => updateTheme('light')}>
              <CiDark size={20} />
              {theme}
            </a>
          ) : (
            <CiDark size={20} onClick={() => updateTheme('light')} />
          )
        ) : isWideScreen ? (
          <a className='with-icon' onClick={() => updateTheme('dark')}>
            <CiLight size={20} />
            {theme}
          </a>
        ) : (
          <CiLight size={20} onClick={() => updateTheme('dark')} />
        )}
      </div>
    </header>
  );
};

export default Nav;
