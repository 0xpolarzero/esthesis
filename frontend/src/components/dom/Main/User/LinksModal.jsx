import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import stores from '@/stores';
import hooks from '@/hooks';

const LinksModal = ({ open, setOpen }) => {
  const retrieveLinksForUser = stores.useInteract(
    (state) => state.retrieveLinksForUser,
  );
  const retrieveMultipleTracks = stores.useSpinamp(
    (state) => state.retrieveMultipleTracks,
  );
  const { isMobile } = hooks.useWindowSize();

  const [retrievingLinks, setRetrievingLinks] = useState(true);
  const [retrievingTracks, setRetrievingTracks] = useState(true);
  const [links, setLinks] = useState([]);
  const [tracks, setTracks] = useState([]);

  const getLinksAndTracks = async () => {
    const links = await retrieveLinksForUser();
    setRetrievingLinks(false);

    if (links) {
      const formatted = links.map((link) => ({
        properties: JSON.parse(link).properties,
        id: JSON.parse(link).properties.sound,
      }));
      setLinks(formatted);

      const ids = formatted.map((link) => link.id);
      const tracks = await retrieveMultipleTracks(ids);
      setTracks(tracks);
      setRetrievingTracks(false);
    }
  };

  useEffect(() => {
    getLinksAndTracks();
  }, [retrieveLinksForUser, retrieveMultipleTracks]);

  return (
    <Modal
      className={`links-modal ${isMobile ? 'mobile' : 'desktop'}`}
      open={open}
      footer={null}
      title='Created links'
      width={isMobile ? '100%' : 'min(90%, 800px)'}>
      {retrievingLinks
        ? 'skeleton table'
        : links.length === 0
        ? 'no links'
        : // display table, on info cell skeleton if retrievingTracks, else tracks.find(track => track.id === link.id)
          'table'}
    </Modal>
  );
};

export default LinksModal;

// track name, artist, link, load customization

const TrackInfo = ({ id }) => {
  const retrieveTrackInfo = stores.useSpinamp(
    (state) => state.retrieveTrackInfo,
  );
  const [retrieving, setRetrieving] = useState(true);

  useEffect(() => {
    const retrieveInfo = async () => {
      const info = await retrieveTrackInfo(id);
      console.log(info);
      setRetrieving(false);
    };

    retrieveInfo();
  }, [id, retrieveTrackInfo]);
};
