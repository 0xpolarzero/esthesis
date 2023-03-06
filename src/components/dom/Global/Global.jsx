import Controls from './Controls';
import Render from '../Render';
import { Background, Sound, Swarm } from '../Main';

const Global = ({ type = 'default' }) => {
  if (type === 'shared')
    return (
      <>
        <Background />
        <Controls type={type} />
        <Render />
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
