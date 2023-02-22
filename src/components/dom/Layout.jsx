import { useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import Nav from '@/components/dom/Nav';
import Audio from '@/components/dom/Audio';
import stores from '@/stores';

const Layout = forwardRef(({ children, ...props }, ref) => {
  const localRef = useRef();
  const { Config } = stores.useConfig();

  useImperativeHandle(ref, () => localRef.current);

  // const audio = useMemo(() => {
  //   return <Audio />;
  // }, []);

  return (
    <Config>
      <div {...props} ref={localRef} className='container'>
        <Nav />
        {/* {audio} */}
        {children}
      </div>
    </Config>
  );
});
Layout.displayName = 'Layout';

export default Layout;
