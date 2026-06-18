'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, PictureInPicture2, RotateCw, Settings } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  onProgress?: (currentTime: number, duration: number) => void
  onEnded?: () => void
  autoPlay?: boolean
}

export default function VideoPlayer({ src, poster, title, onProgress, onEnded, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isPiPSupported, setIsPiPSupported] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)

  const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0)
    }

    const handleTimeUpdate = () => {
      const time = video.currentTime
      setCurrentTime(time)
      if (onProgress) onProgress(time, video.duration || 0)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      if (onEnded) onEnded()
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    // Check PiP support
    setIsPiPSupported(!!(document.pictureInPictureEnabled || (video as any).webkitSetPresentationMode))

    if (autoPlay) {
      video.play().catch(() => {})
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [onProgress, onEnded, autoPlay])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch(console.error)
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const changeVolume = (newVolume: number) => {
    const video = videoRef.current
    if (!video) return
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    if (isMuted) {
      video.volume = volume || 0.8
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = rate
    setPlaybackRate(rate)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen().catch(console.error)
    }
  }

  const togglePiP = async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await video.requestPictureInPicture()
      }
    } catch (err) {
      console.error('PiP error:', err)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl group">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full aspect-video bg-black"
        playsInline
        controls={false}
      />

      {/* Custom Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Progress Bar */}
        <div 
          ref={progressRef}
          onClick={handleSeek}
          className="w-full h-1.5 bg-white/30 rounded-full mb-3 cursor-pointer relative"
        >
          <div 
            className="h-full bg-primary-500 rounded-full transition-all"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow -ml-1.5"
            style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-full transition">
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>

            <div className="flex items-center gap-2 text-sm font-mono tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span className="text-white/50">/</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 ml-2">
              <button onClick={toggleMute} className="p-1.5 hover:bg-white/10 rounded-full">
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-20 accent-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Playback Speed */}
            <div className="relative group/speed">
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm hover:bg-white/10 rounded-lg">
                <Settings size={16} /> {playbackRate}x
              </button>
              <div className="absolute bottom-full mb-2 right-0 hidden group-hover/speed:block bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50">
                {rates.map(rate => (
                  <button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={`block w-full text-left px-4 py-1.5 text-sm hover:bg-slate-700 ${playbackRate === rate ? 'text-primary-400 font-medium' : ''}`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {isPiPSupported && (
              <button onClick={togglePiP} className="p-2 hover:bg-white/10 rounded-full transition" title="Picture in Picture">
                <PictureInPicture2 size={20} />
              </button>
            )}

            <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-full transition" title="Fullscreen">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>

      {title && (
        <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm font-medium">
          {title}
        </div>
      )}
    </div>
  )
}
