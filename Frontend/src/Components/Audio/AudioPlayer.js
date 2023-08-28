import React from 'react';
import { useRef } from 'react';

const AudioPlayer = ({src, playingCard, setPlayingCard}) => {
  const audio = useRef();
  if (!audio.current) {
    audio.current = new Audio(src);
  } 

const onPlay = () => {
  if(audio.current && playingCard !== null && playingCard !== audio.current){
    playingCard.pause();
    setPlayingCard(audio.current);
  }else{
    setPlayingCard(audio.current);
  }

}


return (
  <audio
    ref={audio}
    controls
    src={src}
    onPlay={onPlay}  
  />
)
}

export default React.memo(AudioPlayer);