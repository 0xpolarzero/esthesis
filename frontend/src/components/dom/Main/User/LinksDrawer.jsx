import { useEffect, useState } from 'react';
import { Drawer, Skeleton, Table, Tooltip } from 'antd';
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

  const onClose = () => {
    // setDataSource([]);
    // setRetrievingLinks(true);
    setOpen(false);
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
      onClose={onClose}
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
        'no links created yet'
      ) : isMobile ? (
        <TableMobile columns={columns} dataSource={dataSource} />
      ) : (
        <Table columns={columns} dataSource={dataSource} />
      )}
    </Drawer>
  );
};

export default LinksDrawer;

// track name, artist, link, load customization

const TableMobile = ({ columns, dataSource }) => {
  return (
    <div className='table-mobile'>
      {dataSource.map((row) => (
        <div className='table-mobile-row' key={row.id}>
          {columns.map((column) => (
            <div className='table-mobile-cell' key={column.key}>
              {column.render
                ? column.render(row[column.key], row)
                : row[column.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
