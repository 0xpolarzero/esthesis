import { useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import Nav from '@/components/dom/Nav';
import stores from '@/stores';

const Layout = forwardRef(({ children, ...props }, ref) => {
  const localRef = useRef();
  const { Config } = stores.useConfig();
  useImperativeHandle(ref, () => localRef.current);

  return (
    <Config>
      <div {...props} ref={localRef} className='container'>
        <Nav {...props} />
        {children}
      </div>
      <div className='bg-wrapper' />
    </Config>
  );
});
Layout.displayName = 'Layout';

export default Layout;
