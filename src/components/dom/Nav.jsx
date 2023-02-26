import { Fragment, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Divider, Dropdown, Tooltip } from 'antd';
import { AiOutlineInfoCircle, AiOutlineMenu } from 'react-icons/ai';
import { CiDark, CiLight } from 'react-icons/ci';
import stores from '@/stores';

const Nav = ({ type = 'default' }) => {
  const { theme, updateTheme } = stores.useConfig((state) => ({
    theme: state.theme,
    updateTheme: state.updateTheme,
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
            </>
          }>
          <AiOutlineInfoCircle size={20} />
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
