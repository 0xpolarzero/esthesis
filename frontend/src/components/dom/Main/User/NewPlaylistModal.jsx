import { useState } from 'react';
import { Modal, Input } from 'antd';
import { toast } from 'react-toastify';
import stores from '@/stores';

const NewPlaylistModal = () => {
  const { newPlaylistModalStatus, setNewPlaylistModalStatus, createPlaylist } =
    stores.useSpinamp((state) => ({
      newPlaylistModalStatus: state.newPlaylistModalStatus,
      setNewPlaylistModalStatus: state.setNewPlaylistModalStatus,
      createPlaylist: state.createPlaylist,
    }));
  const [title, setTitle] = useState('');

  const handleOk = async () => {
    const notif = toast.loading('Creating playlist...');
    const res = await createPlaylist(title);

    if (res) {
      toast.update(notif, {
        render: 'Playlist created!',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
      setNewPlaylistModalStatus(false, null);
    } else {
      toast.update(notif, {
        render: 'An error occurred.',
        type: 'error',
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  const handleCancel = () => {
    setNewPlaylistModalStatus(false, null);
  };

  return (
    <Modal
      title='Create a new playlist'
      open={newPlaylistModalStatus.open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText='Create'>
      <Input
        placeholder='Playlist title'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
    </Modal>
  );
};

export default NewPlaylistModal;
