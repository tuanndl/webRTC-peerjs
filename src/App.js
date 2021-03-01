import Peer from 'peerjs';
import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const createUserId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const Video = (props) => {
  const ref = useRef();
  useEffect(() => {
    props.peer.on('stream', (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return <video playsInline autoPlay ref={ref} />;
};

function App() {
  const useVideo = useRef();
  const useVideoRemote = useRef();
  const peersRef = useRef([]);

  const [peers, setPeers] = useState([]);
  const [peerId, setPeerId] = useState();
  const [input, setInput] = useState();
  const [currentPeer, setCurrentPeer] = useState([]);
  const [currentStream, setCurrentStream] = useState(null);

  useEffect(() => {
    try {
      const peer = new Peer(createUserId());

      peer.on('open', (id) => {
        setPeerId(id);
      });

      var getUserMedia =
        navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      peer.on('call', function (call) {
        getUserMedia(
          { video: true, audio: true },
          function (stream) {
            useVideo.current.srcObject = stream;

            call.answer(stream); // Answer the call with an A/V stream.
            call.on('stream', function (remoteStream) {
              // Show stream in some video/canvas element.
              useVideoRemote.current.srcObject = remoteStream;
            });
          },
          function (err) {
            console.log('Failed to get local stream', err);
          }
        );
      });

      setCurrentPeer(peer);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const onCall = () => {
    const getUserMedia =
      navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    getUserMedia(
      { video: true, audio: true },
      function (stream) {
        useVideo.current.srcObject = stream;

        const call = currentPeer.call(input, stream);
        call.on('stream', function (remoteStream) {
          // Show stream in some video/canvas element.
          useVideoRemote.current.srcObject = remoteStream;
        });
      },

      function (err) {
        console.log('Failed to get local stream', err);
      }
    );
  };

  const onChange = (e) => {
    setInput(e.target.value);
  };

  return (
    <div className='App'>
      {/* {peersRef.current.map((peer, index) => {
        return <Video key={index} peer={peer} />;
      })} */}

      <div>
        <h3>PEER-ID: {peerId}</h3>
        <input value={input} name='a' onChange={onChange} />

        <button onClick={onCall}>CALL VIDEO</button>
      </div>

      <video style={{ width: '40%', height: '40%' }} muted ref={useVideo} autoPlay playsInline />

      <video
        style={{ width: '40%', height: '40%' }}
        muted
        ref={useVideoRemote}
        autoPlay
        playsInline
      />
    </div>
  );
}

export default App;
