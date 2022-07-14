import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const SocketContext = createContext();

const socket = io('http://localhost:5000');
// const socket = io('https://warm-wildwood-81069.herokuapp.com');

const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');


 

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);

        myVideo.current.srcObject = currentStream;
      });


    //1st 
    socket.on('me', (id) =>{


      console.log("id creation")
      setMe(id)

    } );


    //4th
    socket.on('callUser', ({ from, name, signal }) => {

      console.log("calluserreact")
      setCall({ isReceivingCall: true, from, name, signal });
    });


    
  }, []);

  const answerCall = () => {

    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      //5th
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

    // connectionRef.current = peer;
  };





  const callUser = (id) => {

    console.log("id",id)
    console.log("me",me)
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      console.log("signal data=>",data)

      //2nd
      socket.emit('callUser', { userToCall: id, signalData: data, from: me, name });
    });

    peer.on('stream', (currentStream) => {
      console.log("stream",currentStream)
      console.log("userVideo",userVideo)
      userVideo.current.srcObject = currentStream;
    });
    

    //8th
    socket.on('callAccepted', (signal) => {

      console.log("callAccepted")
      setCallAccepted(true);

      peer.signal(signal);
    });

    // connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);

    // connectionRef.current.destroy();

    window.location.reload();
  };




  return (
    <SocketContext.Provider value={{
      call,
      callAccepted,
      myVideo,
      userVideo,
      stream,
      name,
      setName,
      callEnded,
      me,
      callUser,
      leaveCall,
      answerCall,
    }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
