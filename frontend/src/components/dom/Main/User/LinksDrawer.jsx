import { useEffect, useState } from 'react';
import { Divider, Drawer, Skeleton, Table, Tooltip } from 'antd';
import stores from '@/stores';
import hooks from '@/hooks';
import TableSkeleton from '../../Utils/TableSkeleton';
import config from '@/data';
import { AiOutlineCopy } from 'react-icons/ai';
import { toast } from 'react-toastify';

const LinksDrawer = ({ open, setOpen }) => {
  const retrieveLinksForUser = stores.useInteract(
    (state) => state.retrieveLinksForUser,
  );
  const { retrieveMultipleTracks, setModalContent } = stores.useSpinamp(
    (state) => ({
      retrieveMultipleTracks: state.retrieveMultipleTracks,
      setModalContent: state.setModalContent,
    }),
  );
  const initSwarm = stores.useSwarm((state) => state.initSwarm);
  const theme = stores.useConfig((state) => state.theme);
  const { isMobile } = hooks.useWindowSize();

  const [retrievingLinks, setRetrievingLinks] = useState(true);
  const [dataSource, setDataSource] = useState([]);

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.info('Link copied to clipboard', {
      autoClose: 2000,
    });
  };

  const loadConfig = (properties) => {
    initSwarm(properties, theme);
    toast.info('Customization loaded', {
      autoClose: 2000,
    });
  };

  const columns = [
    {
      title: 'Track',
      dataIndex: 'track',
      key: 'track',
      render: (text, record) => (
        <a onClick={() => setModalContent(record.trackInfo)}>{text}</a>
      ),
    },
    {
      title: 'Link',
      dataIndex: 'url',
      key: 'link',
      render: (text) => (
        <span className='with-icon interact-svg'>
          <a href={text} target='_blank' rel='noreferrer'>
            {text}
          </a>
          <Tooltip title='Copy link to clipboard'>
            <AiOutlineCopy size={20} onClick={() => copyLink(text)} />
          </Tooltip>
        </span>
      ),
    },
    {
      title: 'Customization',
      dataIndex: 'properties',
      key: 'customization',
      // Render load customization button
      render: (_, record) => (
        <a onClick={() => loadConfig(record.properties)}>Load</a>
      ),
    },
  ];

  useEffect(() => {
    if (!open) return;

    const getLinksAndTracks = async () => {
      const links = await retrieveLinksForUser();
      setRetrievingLinks(false);

      if (links) {
        const formatted = links.map((link) => ({
          id: link.id,
          soundId: JSON.parse(link.properties).sound,
          track: <Skeleton active title={false} paragraph={{ rows: 1 }} />,
          url: `${config.baseUrl}shared?id=${link.id}`,
          properties: JSON.parse(link.properties),
        }));
        // Set temporary data source without track names
        setDataSource(formatted);

        const tracks = await retrieveMultipleTracks(
          formatted.map((link) => link.soundId),
        );
        setDataSource(
          formatted.map((link) => {
            const track = tracks.find((track) => track.id === link.soundId);

            return {
              ...link,
              track: `${track.artist.name} - ${track.title}`,
              trackInfo: track,
            };
          }),
        );
      }
    };

    getLinksAndTracks();
  }, [open, retrieveLinksForUser, retrieveMultipleTracks]);

  return (
    <Drawer
      className={`links-modal ${isMobile ? 'mobile' : 'desktop'}`}
      open={open}
      onClose={() => setOpen(false)}
      footer={null}
      title='Created links'
      width={isMobile ? '100%' : 'min(90%, 1400px)'}>
      {retrievingLinks ? (
        isMobile ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              width: '100%',
            }}>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton.Input key={i} active />
              ))}
          </div>
        ) : (
          <TableSkeleton colCount={columns.length} rowCount={5} />
        )
      ) : dataSource.length === 0 ? (
        <span style={{ color: 'var(--text-main)' }}>no links created yet</span>
      ) : isMobile ? (
        <TableMobile dataSource={dataSource} />
      ) : (
        <Table columns={columns} dataSource={dataSource} />
      )}
    </Drawer>
  );
};

const TableMobile = ({ dataSource }) => {
  const setModalContent = stores.useSpinamp((state) => state.setModalContent);
  const initSwarm = stores.useSwarm((state) => state.initSwarm);
  const theme = stores.useConfig((state) => state.theme);

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.info('Link copied to clipboard', {
      autoClose: 2000,
      position: 'bottom-right',
    });
  };

  const loadConfig = (properties) => {
    initSwarm(properties, theme);
    toast.info('Customization loaded', {
      autoClose: 2000,
      position: 'bottom-right',
    });
  };

  return (
    <div>
      {dataSource.map((row, index) => (
        <div key={row.id}>
          <a onClick={() => setModalContent(row.trackInfo)}>{row.track}</a>
          <span
            className='with-icon interact-svg'
            style={{ justifyContent: 'space-between' }}>
            <a href={row.url} target='_blank' rel='noreferrer'>
              {`${row.url.slice(0, 16)}...${row.url.slice(-12)}`}
            </a>
            <Tooltip title='Copy link to clipboard'>
              <AiOutlineCopy size={20} onClick={() => copyLink(row.url)} />
            </Tooltip>
          </span>
          <a onClick={() => loadConfig(row.properties)}>Load customization</a>
          {index !== dataSource.length - 1 && <Divider type='horizontal' />}
        </div>
      ))}
    </div>
  );
};

export default LinksDrawer;
