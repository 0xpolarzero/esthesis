import { Fragment, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Divider, Dropdown, Tooltip } from 'antd';
import { AiOutlineInfoCircle, AiOutlineMenu } from 'react-icons/ai';
import { CiLight, CiDark } from 'react-icons/ci';
import stores from '@/stores';
import config from '@/data';
import hooks from '@/hooks';

const Nav = () => {
  const { theme, updateTheme } = stores.useConfig((state) => ({
    theme: state.theme,
    updateTheme: state.updateTheme,
  }));

  return (
    <header className='nav'>
      <div className='title'>
        sound<span className='emphasize'>swarm</span>
      </div>

      <div className='links'>
        {/* <Links /> */}
        {/* Icons */}
        <Tooltip
          title={
            <>
              Powered by{' '}
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

const Links = () => {
  const { isMobile } = hooks.useWindowSize();
  const router = useRouter();

  useEffect(() => {
    const index = config.nav['en'].findIndex(
      (item) => item === router.pathname.slice(1),
    );

    if (index !== -1) {
      setActivePage(config.nav[language][index]);
    } else if (router.pathname === '/') {
      setActivePage(config.nav[language][0]);
    } else {
      setActivePage('');
    }
  }, [router.pathname, setActivePage, language]);

  const items = [
    {
      key: '1',
      label: (
        <a
          onClick={() => router.push('/')}
          className={router.pathname === '/' ? 'active' : ''}>
          {config.nav[language][0]}
        </a>
      ),
    },
    {
      key: '2',
      label: (
        <a
          onClick={() => router.push('/education')}
          className={router.pathname === '/education' ? 'active' : ''}>
          {config.nav[language][1]}
        </a>
      ),
    },
    {
      key: '3',
      label: (
        <a
          onClick={() => router.push('/about')}
          className={router.pathname === '/about' ? 'active' : ''}>
          {config.nav[language][2]}
        </a>
      ),
    },
  ];

  if (isMobile)
    return (
      <>
        <Dropdown menu={{ items }} trigger={['click']} arrow>
          <a onClick={(e) => e.preventDefault()}>
            <AiOutlineMenu size={20} />
          </a>
        </Dropdown>
        <Divider type='vertical' />
      </>
    );

  return items.map((item) => (
    <Fragment key={item.key}>
      {item.label}
      <Divider type='vertical' />
    </Fragment>
  ));
};

export default Nav;
