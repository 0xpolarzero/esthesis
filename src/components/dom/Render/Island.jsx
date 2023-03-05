import stores from '@/stores';
import hooks from '@/hooks';

const Island = () => {
  const playing = stores.useAudio((state) => state.playing);
  const { isMobile } = hooks.useWindowSize();

  if (!playing) return null;
  console.log(playing.data.description);

  return (
    <div className={`island ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className='content'>
        <span className='artist'>{playing.data.artist.name}</span>
        <span className='title'>{playing.data.title}</span>
        <span className='platform'>{playing.data.platformId}</span>
        <span className='date'>
          {new Date(playing.data.createdAtTime).toLocaleDateString()}
        </span>
        <span className='description'>
          {playing.data.description.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};

export default Island;
