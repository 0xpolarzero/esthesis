import Controls from './Controls';
import Background from './Background';
import Render from '../Render';
import { Sound, Swarm } from '../Main';

const Global = ({ type = 'default' }) => {
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
      <Sound />
      <Swarm />
      <Controls />
    </>
  );
};
export default Global;
