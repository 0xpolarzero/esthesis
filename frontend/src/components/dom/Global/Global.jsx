import { useEffect, useRef, useState } from 'react';
import { Tabs } from 'antd';
import { Explore, Customize } from '../Main';
import Controls from './Controls';
import Background from './Background';
import Render from '../Render';
import hooks from '@/hooks';
import { AiOutlineCompass, AiOutlineEye, AiOutlineTool } from 'react-icons/ai';

const Global = ({ type = 'default' }) => {
  const { isMobile, isWideScreen } = hooks.useWindowSize();
  const [tabPos, setTabPos] = useState('top');
  const [hide, setHide] = useState(false);

  const main = useRef(null);

  // useEffect(() => {
  //   if (isWideScreen) {
  //     setTabPos('left');
  //   } else {
  //     setTabPos('top');
  //   }
  // }, [isWideScreen]);

  const tabItems = [
    {
      key: '1',
      // label: (
      //   <span className='with-icon'>
      //     <AiOutlineCompass size={20} /> explore
      //   </span>
      // ),
      label: 'explore',
      children: <Explore />,
    },
    {
      key: '2',
      // label: (
      //   <span className='with-icon'>
      //     <AiOutlineTool size={20} /> customize
      //   </span>
      // ),
      label: 'customize',
      children: <Customize />,
    },
    {
      key: '3',
      label: (
        <span className='with-icon'>
          <AiOutlineEye size={20} /> {/* hide */}
        </span>
      ),
      children: null,
    },
  ];

  if (type === 'shared')
    return (
      <>
        <Background />
        <Render />
        <Controls type={type} />
      </>
    );

  return (
    <>
      <Background />
      <div
        ref={main}
        className={`main ${
          isMobile ? 'mobile' : isWideScreen ? 'desktop wide' : 'desktop'
        }`}
        style={{ opacity: hide ? 0.3 : 1, transition: 'opacity 0.2 ease-in' }}>
        <Tabs
          tabPosition={tabPos}
          items={tabItems}
          defaultActiveKey={['1']}
          onTabClick={(key) => {
            main?.current.scrollTo(0, 0);
            setHide(key === '3');
          }}
        />
      </div>
      <Controls />
    </>
  );
};
export default Global;
