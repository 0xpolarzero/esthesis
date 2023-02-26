import Controls from './Controls';
import Render from '../Render';
import { Sound, Swarm } from '../Main';

const Global = ({ type = 'default' }) => {
  if (type === 'shared')
    return (
      <>
        <Controls type={type} />
        <Render />
      </>
    );

  return (
    <>
      <Sound />
      <Swarm />
      <Controls />
    </>
  );
};
export default Global;
