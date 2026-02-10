import { ref, onUnmounted } from 'vue';
import Player from 'xgplayer';
import { nextTick } from 'vue';
import { useMessage } from 'naive-ui';

export function useVideoPlayer() {
  const url = ref('');
  const currentTime = ref(0);
  let videoPlayer: Player | null = null;
  const message = useMessage();
  let timeInterval: ReturnType<typeof setInterval> | null = null;

  const initPlayer = (videoUrl: string, containerId: string = 'video-container') => {
    if (videoPlayer && url.value !== videoUrl) {
      try {
        videoPlayer.destroy();
      } catch (e) {
        console.warn('Error destroying video player:', e);
      }
      videoPlayer = null;
    }

    if (videoUrl) {
      nextTick(() => {
        try {
          videoPlayer = new Player({
            id: containerId,
            url: videoUrl,
            fitVideoSize: 'fixWidth',
            width: '100%',
          });
          url.value = videoUrl;
          
          // Start time tracking
          if (timeInterval) {
            clearInterval(timeInterval);
          }
          timeInterval = setInterval(() => {
            if (videoPlayer) {
              currentTime.value = videoPlayer.currentTime;
            }
          }, 100);
        } catch (error) {
          message.error('Initialization of video player failed!', {
            duration: 5000
          });
          console.error('Video player initialization error:', error);
        }
      });
    }
  };

  const seekTo = (time: number) => {
    if (videoPlayer) {
      videoPlayer.seek(time / 1000, 'pause');
    }
  };

  const destroyPlayer = () => {
    if (videoPlayer) {
      try {
        videoPlayer.destroy();
      } catch (e) {
        console.warn('Error destroying video player:', e);
      }
      videoPlayer = null;
    }
    if (timeInterval) {
      clearInterval(timeInterval);
      timeInterval = null;
    }
  };

  onUnmounted(() => {
    destroyPlayer();
  });

  return {
    url,
    currentTime,
    initPlayer,
    seekTo,
    destroyPlayer
  };
}

