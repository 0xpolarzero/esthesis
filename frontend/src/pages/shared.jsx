import dynamic from 'next/dynamic';
import Global from '@/components/dom/Global';

const Experience = dynamic(() => import('@/components/canvas/Experience'), {
  ssr: false,
});

export default function Page(props) {
  return <Global type='shared' />;
}

Page.canvas = (props) => <Experience />;

export async function getStaticProps() {
  return { props: { title: 'visualize', type: 'shared' } };
}
